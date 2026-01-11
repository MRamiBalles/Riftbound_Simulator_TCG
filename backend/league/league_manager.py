import torch
import numpy as np
import logging
from game_gym import RiftboundEnv
from models.muzero_nexus import MuZeroNexus

class LeagueManager:
    """
    ROA-Star League Manager.
    Handles asymmetric matchmaking between Trainee (Exploiter) and Fixed Opponent (MainAgent).
    """
    def __init__(self, main_agent_path="backend/models/muzero_main_v1.pt"):
        self.env = RiftboundEnv()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load the Fixed Opponent (Teacher/Target)
        self.opponent = MuZeroNexus().to(self.device)
        try:
            self.opponent.load_state_dict(torch.load(main_agent_path, map_location=self.device))
            self.opponent.eval() # Freeze weights
            print(f"LeagueManager: Loaded Fixed Opponent from {main_agent_path}")
        except Exception as e:
            print(f"LeagueManager Error: Could not load opponent. {e}")
            self.opponent = None # Fallback or fail

    def get_opponent_action(self, obs):
        """
        Queries the frozen opponent for an action given the current observation.
        """
        if self.opponent is None: return 0, 0.0

        with torch.no_grad():
            obs_t = torch.tensor(obs).unsqueeze(0).to(self.device)
            # Representation
            s0 = self.opponent.representation(obs_t)
            # Prediction
            p, v = self.opponent.prediction(s0)
            
            # Greedy action for strong opposition (or sample for diversity)
            action_idx = torch.argmax(p[0]).item()
            return action_idx, v.item()

    def get_opponent_value(self, obs):
        """
        Returns the Value (V) estimate of the opponent for a given state.
        Used for Minimax Reward calculation.
        """
        if self.opponent is None: return 0.0

        with torch.no_grad():
            obs_t = torch.tensor(obs).unsqueeze(0).to(self.device)
            s0 = self.opponent.representation(obs_t)
            _, v = self.opponent.prediction(s0)
            return v.item()
