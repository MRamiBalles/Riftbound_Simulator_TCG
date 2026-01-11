import json
import os
import numpy as np

# Mocking the SemanticVectorizer usage by loading the cache directly
# In production, this would import SemanticVectorizer and run it on raw text.
# For now, we assume card_embeddings_cache.json IS the source of truth from Phase 1.

def build_atlas():
    base_dir = os.path.dirname(__file__)
    cache_path = os.path.join(base_dir, '..', 'backend', 'embeddings', 'card_embeddings_cache.json')
    output_path = os.path.join(base_dir, '..', 'src', 'data', 'semantic_atlas.json') # Frontend public asset

    print(f"Building Semantic Atlas from {cache_path}...")
    
    if not os.path.exists(cache_path):
        print("Error: Embeddings cache not found. Please run card_embeddings.py first.")
        return

    with open(cache_path, 'r') as f:
        embeddings = json.load(f)

    # The cache contains 384-dim lists.
    # For RTIM Edge Cache, we might want to quantize or just keep them as float lists.
    # JSON is text-based, so it will be large. In real RTIM we use binary (.bin).
    # For this prototype, JSON is fine, but we will truncate to 3 decimals to save space.
    
    atlas = {}
    for card_id, vec in embeddings.items():
        # Optimization: Round to 4 decimal places
        optimized_vec = [round(x, 4) for x in vec]
        # Optimization: We only need the first 16 dimensions if using the bottleneck? 
        # No, the spatial vectorizer uses the cache directly, but extracting specifics.
        # Let's verify SpatialVectorizer usage.
        # It uses: return emb[:16]
        # SO WE ONLY NEED TO STORE THE FIRST 16 DIMENSIONS FOR THE CLIENT!
        # This is a HUGE optimization.
        
        atlas[card_id] = optimized_vec[:16]

    # Save to src/data for Frontend access
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(atlas, f)

    print(f"Semantic Atlas built!")
    print(f"Original Count: {len(embeddings)}")
    print(f"Atlas Count: {len(atlas)}")
    print(f"Dimensions per card: {len(atlas[list(atlas.keys())[0]])} (Optimized for Spatial Pipeline)")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    build_atlas()
