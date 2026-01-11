import gymnasium as gym
from gymnasium import spaces
import numpy as np
from spatial_vectorizer import SpatialVectorizer
from game_logic import PythonCoreEngine

class RiftboundEnv(gym.Env):
    """
    Riftbound Strategic Gym [Spatial Edition].
    Integrates PythonCoreEngine with SpatialVectorizer [32, 9, 5].
    """
    metadata = {"render_modes": ["human"], "render_fps": 4}

    def __init__(self, render_mode=None):
        super().__init__()
        
        self.engine = PythonCoreEngine()
        self.vectorizer = SpatialVectorizer(channels=32, height=9, width=5)
        
        self.observation_space = spaces.Box(
            low=0, high=1, shape=(32, 9, 5), dtype=np.float32
        )
        
        # Action space: 128 discrete actions (indexed action space)
        self.action_space = spaces.Discrete(128)
        
        self.render_mode = render_mode

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        state = self.engine.reset()
        
        # Vectorize initial state
        observation = self.vectorizer.vectorize(
            self._serialize_state(state), 
            player_id="player"
        )
        
        info = {"legal_actions": self.engine.get_legal_actions("player")}
        return observation, info

    def step(self, action_idx):
        # 1. Map action index to engine action (Prototype mapping)
        legal_actions = self.engine.get_legal_actions("player")
        
        # For prototype, we take action = action_idx % len(legal_actions)
        if legal_actions:
            action = legal_actions[action_idx % len(legal_actions)]
            self.engine.apply_action(action)
        
        # 2. Get new state
        raw_state = self.engine.state
        observation = self.vectorizer.vectorize(
            self._serialize_state(raw_state), 
            player_id="player"
        )
        
        # 3. Calculate reward (Win/Loss + Health diff)
        reward = 0.0
        terminated = False
        if raw_state.winner == "player":
            reward = 10.0
            terminated = True
        elif raw_state.winner == "opponent":
            reward = -10.0
            terminated = True
            
        # Intermediate rewards (Heuristic help for training)
        reward += (raw_state.players["player"].health - 20) * 0.1
        
        truncated = False
        info = {"legal_actions": self.engine.get_legal_actions("player")}
        
        return observation, reward, terminated, truncated, info

    def _serialize_state(self, state):
        """Converts internal Python objects to dict for vectorizer."""
        # This is a simplified serialization for the SpatialVectorizer
        res = {
            "turn": state.turn,
            "activePlayer": state.active_player,
            "phase": state.phase,
            "players": {
                pid: {
                    "health": p.health,
                    "mana": p.mana,
                    "hand": [{"id": c.id, "attack": c.attack, "health": c.health} for c in p.hand],
                    "field": [{"id": c.id, "attack": c.attack, "health": c.health, "keywords": c.keywords} for c in p.field]
                } for pid, p in state.players.items()
            }
        }
        return res

    def render(self):
        pass

    def close(self):
        pass
