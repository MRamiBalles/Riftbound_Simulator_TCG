from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from game_gym import RiftboundEnv
import os
import logging

logger = logging.getLogger("RiftboundNeural.Agent")

class NeuralAgent:
    def __init__(self, model_path="ppo_riftbound_sovereign"):
        self.model_path = model_path
        self.model = None

    def initialize(self):
        """Creates or loads the PPO model."""
        # Ensure path is relative to backend if running from root, or absolute
        actual_path = self.model_path
        if not os.path.exists(f"{actual_path}.zip"):
            # Try backend/ prefix
            if os.path.exists(f"backend/{actual_path}.zip"):
                actual_path = f"backend/{actual_path}"
            elif os.path.exists(f"../backend/{actual_path}.zip"):
                 actual_path = f"../backend/{actual_path}"
        
        if os.path.exists(f"{actual_path}.zip"):
            self.model = PPO.load(actual_path)
            logger.info(f"SUCCESS: Loaded existing model from {actual_path}")
        else:
            # Create a wrapped environment
            vec_env = make_vec_env(RiftboundEnv, n_envs=1)
            self.model = PPO("MlpPolicy", vec_env, verbose=1)
            logger.warning(f"NOTICE: Created new PPO model (Trained model not found at {actual_path})")

    def predict(self, observation):
        if not self.model:
            raise ValueError("Model not initialized. Call initialize() first.")
        
        action, _states = self.model.predict(observation, deterministic=True)
        return action

    def train(self, total_timesteps=10000):
        if not self.model:
            self.initialize()
            
        print(f"Starting training for {total_timesteps} steps...")
        self.model.learn(total_timesteps=total_timesteps)
        self.model.save(self.model_path)
        print("Training complete and model saved.")

# Singleton instance
agent = NeuralAgent()
