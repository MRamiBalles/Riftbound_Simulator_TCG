import gymnasium as gym
import numpy as np
from gymnasium import spaces
from ..game_logic import PythonCoreEngine

class RiftboundEnv(gym.Env):
    """
    Custom Environment that follows gym interface.
    The agent plays as 'player'. The opponent plays randomly (for now).
    """
    metadata = {'render.modes': ['human']}

    def __init__(self):
        super(RiftboundEnv, self).__init__()
        
        self.engine = PythonCoreEngine()
        
        # Action Space: 
        # 0: End Turn
        # 1-10: Play Card from Hand Index 0-9
        # 11-16: Attack with Unit at Field Index 0-5
        self.action_space = spaces.Discrete(17)

        # Observation Space:
        # [PlayerHP, PlayerMana, OppHP, OppMana, HandCardsCost... (10), FieldCardsAttack... (6)]
        # simplified vector
        self.observation_space = spaces.Box(low=0, high=20, shape=(24,), dtype=np.float32)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.engine.reset()
        return self._get_obs(), {}

    def step(self, action):
        # 1. Map Discrete Action to Game Action
        game_action = self._map_action(action)
        
        # 2. Apply Action if valid
        legal_actions = self.engine.get_legal_actions("player")
        
        # Check validity (Simplified Check)
        is_legal = False
        # Implementation of strict checking would loop legal_actions to match game_action details
        # For MVP training, we just penalize invalid actions heavily and skip execution
        # But to make it work, let's assume if it maps to a potential type, we try to execute.
        
        reward = 0
        terminated = False
        truncated = False
        
        # Execute Player Action
        prev_hp_opp = self.engine.state.players["opponent"].health
        
        if game_action:
             # Try to find matching legal action to be strict
             # (In full impl, we use Maskable PPO to avoid this)
             self.engine.apply_action(game_action)
             
             # Reward Shaping
             current_hp_opp = self.engine.state.players["opponent"].health
             damage_dealt = prev_hp_opp - current_hp_opp
             reward += damage_dealt * 1  # Reward for damage
             
             if game_action['type'] == 'PLAY_CARD':
                 reward += 0.5 # Small reward for playing stuff (tempo)

        # check win
        if self.engine.state.winner == "player":
            reward += 100
            terminated = True
        
        # If action was End Turn, Simulate Opponent Turn immediately
        if game_action and game_action['type'] == 'END_TURN' and not terminated:
             self._simulate_opponent()
             if self.engine.state.winner == "opponent":
                 reward -= 100
                 terminated = True

        info = {}
        return self._get_obs(), reward, terminated, truncated, info

    def _map_action(self, action_idx):
        player = self.engine.state.players["player"]
        
        if action_idx == 0:
            return {"type": "END_TURN"}
        
        # Play Card
        if 1 <= action_idx <= 10:
            hand_idx = action_idx - 1
            if hand_idx < len(player.hand):
                card = player.hand[hand_idx]
                if player.mana >= card.cost:
                    return {"type": "PLAY_CARD", "card_id": card.id}
        
        # Attack
        if 11 <= action_idx <= 16:
            field_idx = action_idx - 11
            if field_idx < len(player.field):
                card = player.field[field_idx]
                return {"type": "ATTACK", "card_id": card.id}
                
        return None # Invalid

    def _simulate_opponent(self):
        # Simple Random Opponent
        while self.engine.state.active_player == "opponent" and not self.engine.state.winner:
            actions = self.engine.get_legal_actions("opponent")
            if not actions:
                break
            # Bias towards playing cards/attacking
            action = random.choice(actions)
            self.engine.apply_action(action)

    def _get_obs(self):
        p = self.engine.state.players["player"]
        o = self.engine.state.players["opponent"]
        
        obs = [
            p.health, p.mana,
            o.health, o.mana
        ]
        
        # Hand Costs (pad to 10)
        hand_costs = [c.cost for c in p.hand] + [0] * (10 - len(p.hand))
        obs.extend(hand_costs)
        
        # Field Attack (pad to 10 -> actually defined 6 in shape logic above, let's fix shape)
        # obs shape is 24.
        # 4 basics + 10 hand = 14. 10 remaining for field.
        field_stats = [c.attack for c in p.field] + [0] * (10 - len(p.field))
        obs.extend(field_stats)
        
        return np.array(obs, dtype=np.float32)
