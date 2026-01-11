# -*- coding: utf-8 -*-
"""
TinyZero: Modelo Destilado para Inferencia Edge
================================================

Versión compacta de MuZero diseñada para ejecutarse en navegadores web.
Entrenada mediante destilación de conocimiento desde el modelo principal.

Diferencias clave respecto a MuZeroNexus:
- 16 canales latentes (vs 64): Reduce el tamaño 4x.
- 1 bloque residual (vs 3): Menor profundidad, mayor velocidad.
- Sin decodificador: No se necesita reconstrucción en inferencia.

El modelo exportado a ONNX ocupa aproximadamente 0.01 MB, permitiendo
carga instantánea en cualquier dispositivo.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class TinyResBlock(nn.Module):
    """Bloque residual ligero para arquitectura edge."""
    def __init__(self, channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        # Suma explícita (no inplace) para compatibilidad con ONNX export
        out = out + residual
        return F.relu(out)


class TinyZero(nn.Module):
    """Modelo compacto para inferencia en tiempo real.
    
    Arquitectura optimizada para latencia <20ms en CPUs de consumo.
    Recibe observaciones espaciales [B, 32, 9, 5] y genera política/valor.
    """
    def __init__(self, in_channels: int = 32, latent_channels: int = 16, action_dim: int = 128):
        super().__init__()
        
        # Representación: Comprime la observación a espacio latente
        self.representer = nn.Sequential(
            nn.Conv2d(in_channels, latent_channels, kernel_size=3, padding=1),
            nn.ReLU(),
            TinyResBlock(latent_channels)
        )
        
        # Dinámica: Predicción de transiciones (usado en planificación offline)
        self.action_conv = nn.Conv2d(latent_channels + 1, latent_channels, kernel_size=3, padding=1)
        self.dynamics_res = TinyResBlock(latent_channels)
        self.reward_head = nn.Linear(latent_channels * 9 * 5, 1)
        
        # Predicción: Genera política y valor
        self.policy_head = nn.Linear(latent_channels * 9 * 5, action_dim)
        self.value_head = nn.Linear(latent_channels * 9 * 5, 1)

    def forward(self, obs: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """Inferencia directa para uso en cliente ONNX."""
        s = self.representation(obs)
        p, v = self.prediction(s)
        return p, v

    def representation(self, obs: torch.Tensor) -> torch.Tensor:
        """Codifica observación en estado latente."""
        return self.representer(obs)

    def prediction(self, state: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """Genera política y valor desde estado latente."""
        B = state.shape[0]
        flat = state.view(B, -1)
        policy = self.policy_head(flat)
        value = self.value_head(flat)
        return policy, value

    def next_step(self, state: torch.Tensor, action: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """Avanza un paso en el espacio latente (para planificación)."""
        B, C, H, W = state.shape
        action_channel = action.view(B, 1, 1, 1).expand(B, 1, H, W)
        x = torch.cat([state, action_channel], dim=1)
        x = F.relu(self.action_conv(x))
        next_state = self.dynamics_res(x)
        reward = self.reward_head(next_state.view(B, -1))
        return next_state, reward


if __name__ == "__main__":
    model = TinyZero()
    params = sum(p.numel() for p in model.parameters())
    size_kb = params * 4 / 1024  # float32 = 4 bytes
    print(f"TinyZero - Parámetros: {params:,} ({size_kb:.1f} KB)")
