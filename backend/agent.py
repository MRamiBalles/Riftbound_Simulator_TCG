from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from game_gym import RiftboundEnv
import os

class NeuralAgent:
    def __init__(self, model_path="ppo_riftbound"):
        self.model_path = model_path
        self.model = None

    def initialize(self):
        """Creates or loads the PPO model."""
        if os.path.exists(f"{self.model_path}.zip"):
            self.model = PPO.load(self.model_path)
            print(f"Loaded existing model from {self.model_path}")
        else:
            # Create a wrapped environment
            vec_env = make_vec_env(RiftboundEnv, n_envs=1)
            self.model = PPO("MlpPolicy", vec_env, verbose=1)
            print("Created new PPO model")

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
