# -*- coding: utf-8 -*-
"""
Entorno Gymnasium para Riftbound TCG
=====================================

Implementa la interfaz estándar de Gymnasium para permitir el entrenamiento
de agentes de aprendizaje por refuerzo en el juego Riftbound.

Espacio de observación:
    Box([0,1], shape=(32, 9, 5)) - Tensor espacial generado por SpatialVectorizer

Espacio de acciones:
    Discrete(128) - Índice de acción mapeado a acciones legales

Función de recompensa:
    +10: Victoria
    -10: Derrota
    +(health - 20) * 0.05: Recompensa intermedia basada en ventaja de vida

El entorno incluye un "oponente interno" que juega acciones aleatorias
para permitir partidas completas durante el entrenamiento.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np
from spatial_vectorizer import SpatialVectorizer
from game_logic import PythonCoreEngine


class RiftboundEnv(gym.Env):
    """Entorno de Riftbound compatible con Gymnasium.
    
    Integra el motor de juego (PythonCoreEngine) con el vectorizador espacial
    para generar observaciones aptas para redes convolucionales.
    """
    
    metadata = {"render_modes": ["human"], "render_fps": 4}

    def __init__(self, render_mode: str = None):
        super().__init__()
        
        self.engine = PythonCoreEngine()
        self.vectorizer = SpatialVectorizer(channels=32, height=9, width=5)
        
        # Observaciones: tensor espacial normalizado
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(32, 9, 5), dtype=np.float32
        )
        
        # Acciones: índice discreto (mapeado a acciones legales en step())
        self.action_space = spaces.Discrete(128)
        
        self.render_mode = render_mode

    def reset(self, seed: int = None, options: dict = None) -> tuple:
        """Reinicia el juego a un estado inicial.
        
        Returns:
            observation: Tensor espacial del estado inicial
            info: Diccionario con acciones legales disponibles
        """
        super().reset(seed=seed)
        state = self.engine.reset()
        
        observation = self.vectorizer.vectorize(
            self._serialize_state(state), 
            player_id="player"
        )
        
        info = {"legal_actions": self.engine.get_legal_actions("player")}
        return observation, info

    def step(self, action_idx: int) -> tuple:
        """Ejecuta una acción y avanza el estado del juego.
        
        Args:
            action_idx: Índice de la acción a ejecutar
        
        Returns:
            observation: Nuevo tensor espacial
            reward: Recompensa obtenida
            terminated: True si el juego terminó
            truncated: True si se alcanzó límite de pasos
            info: Información adicional
        """
        # 1. Ejecutar acción del jugador
        legal_actions = self.engine.get_legal_actions("player")
        
        if legal_actions:
            # Mapeo seguro: acción modulo número de acciones legales
            action = legal_actions[action_idx % len(legal_actions)]
            self.engine.apply_action(action)

        # 2. Simular turno del oponente (política aleatoria)
        self._play_opponent_turn()
        
        # 3. Generar observación desde la perspectiva del jugador
        raw_state = self.engine.state
        observation = self.vectorizer.vectorize(
            self._serialize_state(raw_state), 
            player_id="player"
        )
        
        # 4. Calcular recompensa
        reward = 0.0
        terminated = False
        
        if raw_state.winner == "player":
            reward = 10.0
            terminated = True
        elif raw_state.winner == "opponent":
            reward = -10.0
            terminated = True
        
        # Recompensa intermedia: ventaja de vida
        reward += (raw_state.players["player"].health - 20) * 0.05
        
        truncated = False
        info = {"legal_actions": self.engine.get_legal_actions("player")}
        
        return observation, reward, terminated, truncated, info

    def _play_opponent_turn(self) -> None:
        """Simula el turno del oponente con política aleatoria.
        
        El bucle continúa hasta que:
        - El juego termine (hay ganador)
        - El turno pase al jugador
        - Se alcance el límite de 100 acciones (protección anti-loop)
        """
        steps = 0
        while not self.engine.state.winner and steps < 100:
            # Si es turno del jugador, parar
            if self.engine.state.active_player == "player":
                break
            
            acting_pid = self.engine.state.active_player
            actions = self.engine.get_legal_actions(acting_pid)
            
            if not actions:
                break
            
            # Política aleatoria simple
            action = actions[np.random.randint(0, len(actions))]
            self.engine.apply_action(action)
            steps += 1

    def _serialize_state(self, state) -> dict:
        """Convierte el estado interno a diccionario para el vectorizador."""
        return {
            "turn": state.turn,
            "activePlayer": state.active_player,
            "phase": state.phase,
            "players": {
                pid: {
                    "health": p.health,
                    "mana": p.mana,
                    "hand": [
                        {"id": c.id, "attack": c.attack, "health": c.health} 
                        for c in p.hand
                    ],
                    "field": [
                        {
                            "id": c.id, 
                            "attack": c.attack, 
                            "health": c.health, 
                            "keywords": c.keywords
                        } 
                        for c in p.field
                    ]
                } 
                for pid, p in state.players.items()
            }
        }

    def render(self) -> None:
        """Renderizado visual (no implementado)."""
        pass

    def close(self) -> None:
        """Limpieza de recursos."""
        pass
