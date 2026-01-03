import numpy as np
from typing import Dict, Any

class StateVectorizer:
    """
    Translates JSON GameState into a fixed-size NumPy vector.
    Target Size: 256 dimensions
    """
    def __init__(self, vector_dim=256):
        self.vector_dim = vector_dim

    def vectorize(self, state: Dict[str, Any]) -> np.ndarray:
        vector = np.zeros(self.vector_dim, dtype=np.float32)
        idx = 0

        # 1. Global State (Indices 0-4)
        vector[0] = min(state.get('turn', 0) / 50.0, 1.0) # Normalized turn
        vector[1] = 1.0 if state.get('activePlayer') == 'player' else 0.0
        vector[2] = 1.0 if state.get('priority') == 'player' else 0.0
        
        phase_map = {'Draw': 0.1, 'Mulligan': 0.2, 'Main': 0.4, 'Combat': 0.6, 'End': 0.8}
        vector[3] = phase_map.get(state.get('phase'), 0.0)
        idx = 5

        # 2. Player States (Indices 5-44)
        for pid in ['player', 'opponent']:
            p_state = state.get('players', {}).get(pid, {})
            vector[idx] = p_state.get('health', 20) / 20.0
            vector[idx+1] = p_state.get('mana', 0) / 10.0
            vector[idx+2] = p_state.get('deckCount', 40) / 40.0
            
            # Simplified Hand Info (Top 5 costs)
            hand = p_state.get('hand', [])[:5]
            for i, card in enumerate(hand):
                vector[idx+3+i] = card.get('cost', 0) / 10.0
            
            idx += 20 # Reserved 20 slots per player

        # 3. Board State (Indices 45-200)
        # Simplified: First 10 units on each field
        for pid in ['player', 'opponent']:
            field = state.get('players', {}).get(pid, {}).get('field', [])[:10]
            for i, unit in enumerate(field):
                vector[idx] = unit.get('attack', 0) / 10.0
                vector[idx+1] = unit.get('health', 0) / 10.0
                vector[idx+2] = 1.0 if 'Barrier' in unit.get('keywords', []) else 0.0
                idx += 5 # Reserved 5 slots per unit position

        return vector

# Global instance
vectorizer = StateVectorizer()

if __name__ == "__main__":
    # Test with dummy data
    test_state = {
        "turn": 5,
        "activePlayer": "player",
        "phase": "Main",
        "players": {
            "player": {"health": 15, "mana": 3, "hand": [], "field": []},
            "opponent": {"health": 20, "mana": 0, "hand": [], "field": []}
        }
    }
    vec = vectorizer.vectorize(test_state)
    print(f"Vectorized State (First 10 dims): {vec[:10]}")
    print(f"Vector Shape: {vec.shape}")
