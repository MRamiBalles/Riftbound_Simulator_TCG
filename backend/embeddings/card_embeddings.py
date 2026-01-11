import json
import numpy as np
import os
from sentence_transformers import SentenceTransformer

# Target: 640-dim latent space ([384-dim semantic] + [256-dim game-state])
# Using all-MiniLM-L6-v2 (384-dim) for <10MB target compliance.

class CardEmbeddingService:
    def __init__(self, model_name='sentence-transformers/all-MiniLM-L6-v2'):
        print(f"Loading embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        # Cache in the same directory as the service
        self.cache_path = os.path.join(os.path.dirname(__file__), 'card_embeddings_cache.json')
        self.embeddings = {}
        self.load_cache()

    def generate_embeddings(self, cards_data):
        print(f"Generating embeddings for {len(cards_data)} cards...")
        texts = []
        ids = []
        
        for card in cards_data:
            # Combine name, text and keywords for richer semantics
            text_context = f"{card.get('name', '')}. {card.get('text', '')}. Keywords: {', '.join(card.get('keywords', []))}"
            texts.append(text_context)
            ids.append(card['id'])
        
        vectors = self.model.encode(texts)
        
        for i, card_id in enumerate(ids):
            self.embeddings[card_id] = vectors[i].tolist()
        
        self.save_cache()
        print("Embeddings generated and cached.")

    def load_cache(self):
        if os.path.exists(self.cache_path):
            try:
                with open(self.cache_path, 'r') as f:
                    self.embeddings = json.load(f)
                print(f"Loaded {len(self.embeddings)} embeddings from cache.")
            except Exception as e:
                print(f"Warning: Failed to load cache: {e}")

    def save_cache(self):
        with open(self.cache_path, 'w') as f:
            json.dump(self.embeddings, f)

if __name__ == "__main__":
    # Path to local data
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'riftbound-data.json'))
    print(f"Looking for data at: {data_path}")
    
    # Handle UTF-8 with BOM (utf-8-sig)
    with open(data_path, 'r', encoding='utf-8-sig') as f:
        cards = json.load(f)
    
    service = CardEmbeddingService()
    service.generate_embeddings(cards)
