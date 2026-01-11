import json
import numpy as np
import os
from sklearn.metrics.pairwise import cosine_similarity

def verify_semantic_cohesion():
    cache_path = os.path.join(os.path.dirname(__file__), 'embeddings', 'card_embeddings_cache.json')
    data_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'riftbound-data.json')
    
    with open(cache_path, 'r') as f:
        embeddings = json.load(f)
    
    with open(data_path, 'r', encoding='utf-8-sig') as f:
        cards = json.load(f)
    
    card_map = {c['id']: c for c in cards}
    
    print("--- Semantic Cohesion Test ---")
    
    # Test cases: Pairs of cards that should be similar
    test_pairs = [
        ("OGN-179", "OGN-061"), # Example: Damage/Kill cards
        ("OGN-066", "OGN-066-p"), # Example: Variants
    ]
    
    # Let's find some cards with "Damage" in text
    damage_cards = [c for c in cards if c.get('text') and "damage" in c['text'].lower()][:3]
    
    for i, c1 in enumerate(damage_cards):
        for j, c2 in enumerate(damage_cards):
            if i >= j: continue
            
            vec1 = np.array(embeddings[c1['id']]).reshape(1, -1)
            vec2 = np.array(embeddings[c2['id']]).reshape(1, -1)
            similarity = cosine_similarity(vec1, vec2)[0][0]
            
            print(f"Similarity: {similarity:.4f}")
            print(f"  A: {c1['name']} - {c1['text']}")
            print(f"  B: {c2['name']} - {c2['text']}")
            print("-" * 20)

    # Random pair test
    c1 = cards[0]
    c2 = cards[100]
    vec1 = np.array(embeddings[c1['id']]).reshape(1, -1)
    vec2 = np.array(embeddings[c2['id']]).reshape(1, -1)
    similarity = cosine_similarity(vec1, vec2)[0][0]
    print(f"Random Similarity ({c1['name']} vs {c2['name']}): {similarity:.4f}")

if __name__ == "__main__":
    verify_semantic_cohesion()
