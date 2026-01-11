# -*- coding: utf-8 -*-
"""
Construcción del Atlas Semántico para Cliente Edge
====================================================

Genera un archivo JSON optimizado con los embeddings de cada carta,
listo para ser cargado por el cliente web sin ejecutar modelos de NLP.

El Atlas Semántico permite inferencia semántica de coste cero en el cliente:
en lugar de ejecutar MiniLM (costoso), simplemente se busca el vector
pre-calculado en un diccionario.

Optimizaciones aplicadas:
- Truncado a 16 dimensiones: Solo se usan las primeras 16 componentes
  del embedding original (384d), suficientes para el pipeline espacial.
- Redondeo a 4 decimales: Reduce el tamaño del JSON sin pérdida perceptible.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import json
import os


def build_atlas() -> None:
    """Construye el Atlas Semántico desde el cache de embeddings."""
    
    base_dir = os.path.dirname(__file__)
    cache_path = os.path.join(
        base_dir, '..', 'backend', 'embeddings', 'card_embeddings_cache.json'
    )
    output_path = os.path.join(
        base_dir, '..', 'src', 'data', 'semantic_atlas.json'
    )

    print(f"Construyendo Atlas Semántico desde {cache_path}...")
    
    # Verificar que existe el cache
    if not os.path.exists(cache_path):
        print("Error: Cache de embeddings no encontrado.")
        print("Ejecuta primero: python backend/embeddings/card_embeddings.py")
        return

    # Cargar embeddings completos
    with open(cache_path, 'r', encoding='utf-8') as f:
        embeddings = json.load(f)

    # Optimizar para cliente edge
    atlas = {}
    for card_id, vec in embeddings.items():
        # Truncar a 16 dimensiones y redondear
        optimized = [round(x, 4) for x in vec[:16]]
        atlas[card_id] = optimized

    # Guardar en directorio público del frontend
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(atlas, f, separators=(',', ':'))  # Sin espacios para menor tamaño

    # Estadísticas
    original_size = os.path.getsize(cache_path) / 1024
    atlas_size = os.path.getsize(output_path) / 1024
    
    print(f"Atlas Semántico construido:")
    print(f"  - Cartas procesadas: {len(atlas)}")
    print(f"  - Dimensiones por carta: 16 (de 384 originales)")
    print(f"  - Tamaño original: {original_size:.1f} KB")
    print(f"  - Tamaño optimizado: {atlas_size:.1f} KB")
    print(f"  - Guardado en: {output_path}")


if __name__ == "__main__":
    build_atlas()
