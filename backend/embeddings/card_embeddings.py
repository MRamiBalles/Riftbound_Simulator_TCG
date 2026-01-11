# -*- coding: utf-8 -*-
"""
Servicio de Embeddings Semánticos para Cartas
==============================================

Genera y cachea vectores de embedding para el texto de cada carta usando
el modelo sentence-transformers/all-MiniLM-L6-v2.

Los embeddings semánticos permiten que el modelo de IA generalice a cartas
nuevas sin re-entrenamiento, ya que cartas con efectos similares tendrán
vectores cercanos en el espacio latente.

El cache se almacena en formato JSON para acceso rápido desde otros scripts.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import json
import os
from sentence_transformers import SentenceTransformer


class CardEmbeddingService:
    """Servicio para generación y gestión de embeddings de cartas.
    
    Usa MiniLM-L6-v2, un modelo compacto (~90MB) que genera embeddings
    de 384 dimensiones optimizados para similitud semántica.
    """
    
    def __init__(self):
        # Ruta del cache de embeddings
        self.cache_path = os.path.join(
            os.path.dirname(__file__), 
            "card_embeddings_cache.json"
        )
        
        # Ruta del archivo de datos de cartas
        self.data_path = os.path.join(
            os.path.dirname(__file__), 
            "..", "..", "src", "data", "riftbound-data.json"
        )
        
        # Modelo de embeddings (carga lazy)
        self._model = None
    
    @property
    def model(self) -> SentenceTransformer:
        """Carga el modelo de embeddings bajo demanda."""
        if self._model is None:
            self._model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        return self._model
    
    def generate_embeddings(self) -> dict:
        """Genera embeddings para todas las cartas y los guarda en cache.
        
        Returns:
            Diccionario {card_id: [embedding_384d]}
        """
        # Cargar datos de cartas
        if not os.path.exists(self.data_path):
            print(f"Error: Archivo de datos no encontrado en {self.data_path}")
            return {}
        
        with open(self.data_path, 'r', encoding='utf-8-sig') as f:
            cards = json.load(f)
        
        print(f"Procesando {len(cards)} cartas...")
        
        embeddings = {}
        for card in cards:
            card_id = str(card.get("id", ""))
            
            # Construir texto descriptivo combinando nombre, tipo y efecto
            name = card.get("name", "")
            card_type = card.get("type", "")
            text = card.get("text", "")
            
            description = f"{name}. {card_type}. {text}".strip()
            
            if description:
                # Generar embedding
                vec = self.model.encode(description).tolist()
                embeddings[card_id] = vec
        
        # Guardar cache
        with open(self.cache_path, 'w', encoding='utf-8') as f:
            json.dump(embeddings, f)
        
        print(f"Cache guardado en {self.cache_path}")
        print(f"Total embeddings: {len(embeddings)}")
        
        return embeddings
    
    def load_cache(self) -> dict:
        """Carga embeddings desde el cache existente.
        
        Returns:
            Diccionario de embeddings o dict vacío si no existe cache
        """
        if os.path.exists(self.cache_path):
            with open(self.cache_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}


if __name__ == "__main__":
    service = CardEmbeddingService()
    service.generate_embeddings()
