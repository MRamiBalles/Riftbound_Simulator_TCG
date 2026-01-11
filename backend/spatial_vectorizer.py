import numpy as np
import json
import os
from typing import Dict, Any

class SpatialVectorizer:
    """
    Translates JSON GameState into a Spatial Tensor [Channels, Height, Width].
    Target: 9x5 grid (Duelyst/Riftbound tactical scale).
    Standardizes input for MuZero Dynamics (g) and Observation Decoder.
    """
    def __init__(self, channels=32, height=9, width=5):
        self.channels = channels
        self.height = height
        self.width = width
        
        # Load card embeddings for semantic context
        self.embeddings = {}
        self.cache_path = os.path.join(os.path.dirname(__file__), 'embeddings', 'card_embeddings_cache.json')
        self.load_embeddings()

    def load_embeddings(self):
        if os.path.exists(self.cache_path):
            with open(self.cache_path, 'r') as f:
                self.embeddings = json.load(f)
            print(f"SpatialVectorizer: Integrated {len(self.embeddings)} embeddings into tensor pipeline.")

    def get_card_feature_vector(self, card_id: str) -> np.ndarray:
        """Extracts a compressed semantic feature from the embedding."""
        if card_id in self.embeddings:
            emb = np.array(self.embeddings[card_id], dtype=np.float32)
            # We take the first 16 dimensions as a representative 'semantic fingerprint'
            # In a production MuZero, we would use PCA or a learnable bottleneck.
            return emb[:16] 
        return np.zeros(16, dtype=np.float32)

    def vectorize(self, state: Dict[str, Any], player_id: str = 'player') -> np.ndarray:
        # Initialize Tensor [C, H, W]
        # H=9 (Horizontal), W=5 (Vertical/Lanes)
        tensor = np.zeros((self.channels, self.height, self.width), dtype=np.float32)
        
        # Mapping Strategy:
        # Since the current engine is linear (6 slots), we'll map them to the central lane (W=2)
        # Player 1 (me) slots: (0-5, 2)
        # Opponent slots: (8-3, 2) - Mirrored
        
        opponent_id = 'opponent' if player_id == 'player' else 'player'
        
        # --- PLAYER FIELD ---
        me = state.get('players', {}).get(player_id, {})
        for i, unit in enumerate(me.get('field', [])[:6]):
            x, y = i, 2 # Map to first 6 tiles of central lane
            self._fill_tile(tensor, x, y, unit, owner=1.0)
            
        # --- OPPONENT FIELD ---
        opp = state.get('players', {}).get(opponent_id, {})
        for i, unit in enumerate(opp.get('field', [])[:6]):
            x, y = 8 - i, 2 # Map to last 6 tiles, mirrored
            self._fill_tile(tensor, x, y, unit, owner=-1.0)
            
        # --- GLOBAL FEATURES (encoded in a separate channel or first tile) ---
        # Turn, Mana, Health
        tensor[0, 0, 0] = min(state.get('turn', 0) / 50.0, 1.0)
        tensor[1, 0, 0] = me.get('health', 20) / 20.0
        tensor[2, 0, 0] = me.get('mana', 0) / 10.0
        tensor[3, 0, 0] = opp.get('health', 20) / 20.0
        
        return tensor

    def _fill_tile(self, tensor, x, y, unit, owner):
        # Channel 0: Presence
        tensor[0, x, y] = 1.0
        # Channel 1: Owner
        tensor[1, x, y] = owner
        # Channel 2: Attack
        tensor[2, x, y] = unit.get('attack', unit.get('currentAttack', 0)) / 10.0
        # Channel 3: Health
        tensor[3, x, y] = unit.get('health', unit.get('currentHealth', 0)) / 10.0
        # Channel 4: Keywords (Simplified mask)
        keywords = unit.get('keywords', [])
        tensor[4, x, y] = 1.0 if 'Barrier' in keywords else 0.0
        tensor[5, x, y] = 1.0 if 'Elusive' in keywords else 0.0
        tensor[6, x, y] = 1.0 if 'Overwhelm' in keywords else 0.0
        
        # Channels 7-22: Semantic Features (16 dims)
        card_id = unit.get('id', '')
        semantic_fingerprint = self.get_card_feature_vector(card_id)
        tensor[7:23, x, y] = semantic_fingerprint

if __name__ == "__main__":
    v = SpatialVectorizer()
    dummy_state = {
        "turn": 10,
        "players": {
            "player": {"health": 15, "mana": 5, "field": [{"id": "OGN-179", "attack": 4, "health": 2}]},
            "opponent": {"health": 20, "mana": 0, "field": []}
        }
    }
    tensor = v.vectorize(dummy_state)
    print(f"Spatial Tensor Shape: {tensor.shape}")
    print(f"Occupied Tile (0, 2): {tensor[0:4, 0, 2]}")
    print(f"Semantic Fingerprint at (0, 2): {tensor[7:12, 0, 2]}")
