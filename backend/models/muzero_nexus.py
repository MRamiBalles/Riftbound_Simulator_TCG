# -*- coding: utf-8 -*-
"""
MuZero Nexus: Arquitectura de Planificación Estratégica
========================================================

Implementación de la arquitectura MuZero adaptada para juegos de cartas coleccionables.
Incluye red de dinámica para predicción de transiciones y decodificador de observaciones
para prevenir estados alucinados en el espacio latente.

Decisiones de diseño:
- 64 canales latentes: Balance entre expresividad y coste computacional.
- 3 bloques residuales: Suficiente profundidad para capturar patrones tácticos.
- Decodificador reconstructivo: Fuerza al modelo a mantener representaciones físicamente coherentes.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class ResBlock(nn.Module):
    """Bloque residual estándar con normalización por lotes.
    
    La suma residual permite que gradientes fluyan directamente hacia capas anteriores,
    facilitando el entrenamiento de redes profundas.
    """
    def __init__(self, channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        # Suma no inplace para compatibilidad con autograd
        out = out + residual
        return F.relu(out)


class RepresentationNetwork(nn.Module):
    """Red de representación h(o) → s.
    
    Transforma observaciones del juego (tensor espacial) en estados latentes compactos.
    La reducción de canales (32→64) y los bloques residuales extraen características
    relevantes para la planificación.
    """
    def __init__(self, in_channels: int = 32, latent_channels: int = 64, num_blocks: int = 3):
        super().__init__()
        self.conv_in = nn.Conv2d(in_channels, latent_channels, kernel_size=3, padding=1)
        self.blocks = nn.Sequential(*[ResBlock(latent_channels) for _ in range(num_blocks)])
    
    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        x = F.relu(self.conv_in(obs))
        return self.blocks(x)


class DynamicsNetwork(nn.Module):
    """Red de dinámica g(s, a) → (s', r).
    
    Predice el siguiente estado latente y la recompensa inmediata dada una acción.
    La acción se inyecta como un canal adicional expandido espacialmente.
    
    Esta red permite "imaginar" trayectorias futuras sin ejecutar el motor del juego,
    habilitando búsqueda tipo MCTS en el espacio latente.
    """
    def __init__(self, latent_channels: int = 64, num_blocks: int = 2):
        super().__init__()
        # +1 canal para la acción codificada
        self.conv_action = nn.Conv2d(latent_channels + 1, latent_channels, kernel_size=3, padding=1)
        self.blocks = nn.Sequential(*[ResBlock(latent_channels) for _ in range(num_blocks)])
        # Predicción de recompensa como valor escalar
        self.reward_head = nn.Linear(latent_channels * 9 * 5, 1)

    def forward(self, state: torch.Tensor, action: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        B, C, H, W = state.shape
        # Expandir la acción a un plano espacial
        action_plane = action.view(B, 1, 1, 1).expand(B, 1, H, W)
        x = torch.cat([state, action_plane], dim=1)
        x = F.relu(self.conv_action(x))
        next_state = self.blocks(x)
        reward = self.reward_head(next_state.view(B, -1))
        return next_state, reward


class ObservationDecoder(nn.Module):
    """Decodificador de observaciones d(s) → ô.
    
    Reconstruye características observables (ataque, vida, etc.) desde el estado latente.
    Sirve como regularizador: si el modelo puede reconstruir la observación, el latente
    contiene información físicamente válida.
    
    Sin este componente, el espacio latente puede "alucinar" estados imposibles.
    """
    def __init__(self, latent_channels: int = 64, out_channels: int = 32):
        super().__init__()
        self.deconv = nn.ConvTranspose2d(latent_channels, out_channels, kernel_size=3, padding=1)
    
    def forward(self, state: torch.Tensor) -> torch.Tensor:
        return self.deconv(state)


class PredictionNetwork(nn.Module):
    """Red de predicción f(s) → (π, v).
    
    Genera la política (distribución de probabilidad sobre acciones) y el valor
    (probabilidad de victoria) desde un estado latente.
    """
    def __init__(self, latent_channels: int = 64, action_dim: int = 128):
        super().__init__()
        flat_size = latent_channels * 9 * 5
        self.policy_head = nn.Linear(flat_size, action_dim)
        self.value_head = nn.Linear(flat_size, 1)
    
    def forward(self, state: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        B = state.shape[0]
        flat = state.view(B, -1)
        policy = self.policy_head(flat)
        value = self.value_head(flat)
        return policy, value


class MuZeroNexus(nn.Module):
    """Modelo MuZero completo para Riftbound.
    
    Combina las cuatro redes (representación, dinámica, predicción, decodificador)
    en una arquitectura unificada que puede:
    - Codificar observaciones del juego.
    - Simular trayectorias futuras.
    - Evaluar posiciones.
    - Reconstruir observaciones (anti-alucinación).
    """
    def __init__(self, in_channels: int = 32, latent_channels: int = 64, action_dim: int = 128):
        super().__init__()
        self.representation = RepresentationNetwork(in_channels, latent_channels)
        self.dynamics = DynamicsNetwork(latent_channels)
        self.prediction_net = PredictionNetwork(latent_channels, action_dim)
        self.decoder = ObservationDecoder(latent_channels, in_channels)
    
    def forward(self, obs: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """Paso hacia adelante para inferencia rápida."""
        state = self.representation(obs)
        policy, value = self.prediction_net(state)
        return policy, value

    def next_step(self, state: torch.Tensor, action: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """Avanza un paso en el espacio latente."""
        return self.dynamics(state, action)

    def reconstruct(self, state: torch.Tensor) -> torch.Tensor:
        """Reconstruye observación desde estado latente."""
        return self.decoder(state)


if __name__ == "__main__":
    # Verificación rápida de la arquitectura
    model = MuZeroNexus()
    dummy_obs = torch.randn(2, 32, 9, 5)
    policy, value = model(dummy_obs)
    print(f"MuZeroNexus - Parámetros: {sum(p.numel() for p in model.parameters()):,}")
    print(f"Policy shape: {policy.shape}, Value shape: {value.shape}")
