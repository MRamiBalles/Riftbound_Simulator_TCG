# -*- coding: utf-8 -*-
"""
Vectorizador Espacial para Observaciones del Juego
===================================================

Transforma el estado del juego en un tensor espacial compatible con
arquitecturas convolucionales (estilo AlphaGo/AlphaZero).

Representación: [C, H, W] donde
- C = 32 canales de características
- H = 9 filas del tablero
- W = 5 columnas del tablero

Distribución de canales:
- Canales 0-15: Embedding semántico comprimido de la unidad en cada celda
- Canal 16: Máscara de presencia (1 si hay unidad, 0 si vacío)
- Canal 17: Propietario (1 si es del jugador activo, 0 si es oponente)
- Canales 18-20: Ataque normalizado (log-scale)
- Canales 21-23: Vida normalizada (log-scale)
- Canales 24-31: Keywords binarios (Quick Attack, Barrier, Overwhelm, etc.)

Esta representación espacial permite que las convoluciones capturen
patrones posicionales (formaciones, flancos) que un vector plano ignora.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import numpy as np
import json
import os


class SpatialVectorizer:
    """Convierte estados de juego a tensores espaciales.
    
    Integra embeddings semánticos pre-calculados con características
    numéricas del estado actual del tablero.
    """
    
    def __init__(self, channels: int = 32, height: int = 9, width: int = 5):
        self.channels = channels
        self.height = height
        self.width = width
        
        # Cargar cache de embeddings semánticos
        self.embeddings = self._load_embeddings()
        
    def _load_embeddings(self) -> dict:
        """Carga embeddings pre-calculados desde el cache JSON."""
        cache_path = os.path.join(
            os.path.dirname(__file__), 
            "embeddings", 
            "card_embeddings_cache.json"
        )
        
        if os.path.exists(cache_path):
            with open(cache_path, 'r', encoding='utf-8') as f:
                embeddings = json.load(f)
            print(f"SpatialVectorizer: Integrados {len(embeddings)} embeddings.")
            return embeddings
        else:
            print("SpatialVectorizer: Cache de embeddings no encontrado.")
            return {}
    
    def _get_semantic_features(self, card_id: str) -> np.ndarray:
        """Obtiene los primeros 16 componentes del embedding de una carta.
        
        Si la carta no tiene embedding, devuelve un vector de ceros.
        Los 16 componentes son suficientes para capturar las relaciones
        semánticas más importantes entre cartas.
        """
        if card_id in self.embeddings:
            emb = self.embeddings[card_id]
            return np.array(emb[:16], dtype=np.float32)
        return np.zeros(16, dtype=np.float32)
    
    def _encode_keywords(self, keywords: list) -> np.ndarray:
        """Codifica keywords como vector binario de 8 dimensiones.
        
        Keywords soportados:
        - Quick Attack, Barrier, Overwhelm, Elusive
        - Lifesteal, Tough, Challenger, Fearsome
        """
        keyword_map = {
            "Quick Attack": 0,
            "Barrier": 1,
            "Overwhelm": 2,
            "Elusive": 3,
            "Lifesteal": 4,
            "Tough": 5,
            "Challenger": 6,
            "Fearsome": 7
        }
        
        vec = np.zeros(8, dtype=np.float32)
        for kw in keywords:
            if kw in keyword_map:
                vec[keyword_map[kw]] = 1.0
        return vec
    
    def vectorize(self, game_state: dict, player_id: str) -> np.ndarray:
        """Convierte un estado de juego a tensor espacial.
        
        Args:
            game_state: Estado serializado del juego (dict)
            player_id: ID del jugador desde cuya perspectiva se genera el tensor
        
        Returns:
            Tensor numpy de forma [C, H, W] normalizado a [0, 1]
        """
        tensor = np.zeros((self.channels, self.height, self.width), dtype=np.float32)
        
        # Mapear unidades del campo al tensor
        for pid, player_data in game_state.get("players", {}).items():
            is_owner = 1.0 if pid == player_id else 0.0
            
            for idx, unit in enumerate(player_data.get("field", [])):
                # Calcular posición en el grid (distribución simple)
                row = idx % self.height
                col = idx // self.height
                
                if col >= self.width:
                    continue  # Fuera del tablero visible
                
                # Canales 0-15: Embedding semántico
                card_id = str(unit.get("id", "0"))
                semantic = self._get_semantic_features(card_id)
                tensor[0:16, row, col] = semantic
                
                # Canal 16: Presencia
                tensor[16, row, col] = 1.0
                
                # Canal 17: Propietario
                tensor[17, row, col] = is_owner
                
                # Canales 18-20: Ataque (log-normalizado)
                attack = unit.get("attack", 0)
                tensor[18, row, col] = min(np.log1p(attack) / 3.0, 1.0)
                
                # Canales 21-23: Vida (log-normalizado)
                health = unit.get("health", 0)
                tensor[21, row, col] = min(np.log1p(health) / 3.0, 1.0)
                
                # Canales 24-31: Keywords
                keywords = unit.get("keywords", [])
                kw_vec = self._encode_keywords(keywords)
                tensor[24:32, row, col] = kw_vec
        
        return tensor


if __name__ == "__main__":
    # Test básico
    vectorizer = SpatialVectorizer()
    dummy_state = {
        "players": {
            "player": {
                "field": [
                    {"id": "1", "attack": 3, "health": 2, "keywords": ["Quick Attack"]}
                ]
            }
        }
    }
    tensor = vectorizer.vectorize(dummy_state, "player")
    print(f"Tensor shape: {tensor.shape}")
    print(f"Presencia en (0,0): {tensor[16, 0, 0]}")
