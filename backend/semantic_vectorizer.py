import numpy as np
import json
import os
from typing import Dict, Any

class SemanticVectorizer:
    """
    Translates JSON GameState into a fixed-size 640-dimension vector.
    Structure: [512-dim semantic] + [128-dim game-state]
    """
    def __init__(self, semantic_dim=512, state_dim=128):
        self.semantic_dim = semantic_dim
        self.state_dim = state_dim
        self.total_dim = semantic_dim + state_dim
        
        # Load card embeddings from cache
        self.embeddings = {}
        self.embedding_size = 384 # all-MiniLM-L6-v2 size
        self.cache_path = os.path.join(os.path.dirname(__file__), 'embeddings', 'card_embeddings_cache.json')
        self.load_embeddings()

    def load_embeddings(self):
        if os.path.exists(self.cache_path):
            with open(self.cache_path, 'r') as f:
                self.embeddings = json.load(f)
            print(f"SemanticVectorizer: Loaded {len(self.embeddings)} card embeddings.")
            if self.embeddings:
                # Get actual size from first entry
                first_key = next(iter(self.embeddings))
                self.embedding_size = len(self.embeddings[first_key])
        else:
            print("SemanticVectorizer Warning: No card embeddings cache found. Using zero vectors.")

    def get_card_embedding(self, card_id: str) -> np.ndarray:
        # Fuzzy match for variants if needed (same as sync script)
        if card_id in self.embeddings:
            return np.array(self.embeddings[card_id], dtype=np.float32)
        
        base_id = "-".join(card_id.split("-")[:2])
        for key in self.embeddings:
            if key.startswith(base_id):
                return np.array(self.embeddings[key], dtype=np.float32)
        
        return np.zeros(self.embedding_size, dtype=np.float32)

    def vectorize(self, state: Dict[str, Any], player_id: str = 'player') -> np.ndarray:
        vector = np.zeros(self.total_dim, dtype=np.float32)
        
        # --- 1. GAME STATE (128 dims) ---
        # Fixed indices [512-640]
        s_idx = self.semantic_dim
        
        # 1.1 Global (10 dims)
        vector[s_idx] = min(state.get('turn', 0) / 50.0, 1.0)
        vector[s_idx+1] = 1.0 if state.get('activePlayer') == player_id else 0.0
        vector[s_idx+2] = 1.0 if state.get('priority') == player_id else 0.0
        
        phase_map = {'Mulligan': 0.1, 'Main': 0.4, 'Combat': 0.6, 'End': 0.8}
        vector[s_idx+3] = phase_map.get(state.get('phase'), 0.0)
        
        # 1.2 Players (20 x 2 = 40 dims)
        opponent_id = 'opponent' if player_id == 'player' else 'player'
        for i, pid in enumerate([player_id, opponent_id]):
            p_state = state.get('players', {}).get(pid, {})
            offset = s_idx + 10 + (i * 20)
            vector[offset] = p_state.get('health', 20) / 20.0
            vector[offset+1] = p_state.get('mana', 0) / 10.0
            vector[offset+2] = p_state.get('deckCount', 40) / 40.0
            vector[offset+3] = len(p_state.get('hand', [])) / 10.0
            vector[offset+4] = len(p_state.get('field', [])) / 6.0

        # 1.3 Field Simple (6 x 2 x 6 features = 72 dims)
        # Features: attack, health, barrier, elusive, etc.
        for i, pid in enumerate([player_id, opponent_id]):
            field = state.get('players', {}).get(pid, {}).get('field', [])[:6]
            for j, unit in enumerate(field):
                offset = s_idx + 50 + (i * 36) + (j * 6)
                if offset + 5 >= self.total_dim: break
                vector[offset] = unit.get('attack', 0) / 10.0
                vector[offset+1] = unit.get('health', 0) / 10.0
                vector[offset+2] = 1.0 if 'Barrier' in unit.get('keywords', []) else 0.0
                vector[offset+3] = 1.0 if 'Elusive' in unit.get('keywords', []) else 0.0
                vector[offset+4] = 1.0 if 'Overwhelm' in unit.get('keywords', []) else 0.0

        # --- 2. SEMANTIC CONTEXT (512 dims) ---
        # Strategy: 
        # - Mean embedding of Hand (384 dims)
        # - Mean embedding of Field (384 dims)
        # - Concatenated or pooled into 512.
        # Since we use 384-dim embeddings, we'll use:
        # [Hand Embedding (384)] + [Field Embedding (128 - truncated or pooled)]
        
        me = state.get('players', {}).get(player_id, {})
        hand = me.get('hand', [])
        field = me.get('field', [])
        
        # HAND POOLING
        hand_embeddings = [self.get_card_embedding(c['id']) for c in hand if 'id' in c]
        if hand_embeddings:
            mean_hand = np.mean(hand_embeddings, axis=0)
            vector[0:384] = mean_hand
        
        # FIELD POOLING (remaining 128 dims)
        field_embeddings = [self.get_card_embedding(u['id']) for u in field if 'id' in u]
        if field_embeddings:
            mean_field = np.mean(field_embeddings, axis=0)
            # Take first 128 elements of mean field embedding as a hash/summary
            vector[384:512] = mean_field[:128]
            
        return vector

if __name__ == "__main__":
    # Test
    v = SemanticVectorizer()
    dummy_state = {
        "turn": 1,
        "activePlayer": "player",
        "phase": "Main",
        "players": {
            "player": {"health": 20, "mana": 1, "hand": [{"id": "OGN-179"}], "field": []},
            "opponent": {"health": 20, "mana": 0, "hand": [], "field": []}
        }
    }
    vec = v.vectorize(dummy_state)
    print(f"Semantic Vector Shape: {vec.shape}")
    print(f"Semantic Part (first 5): {vec[:5]}")
    print(f"Numerical Part (start): {vec[512:512+5]}")
