from stable_baselines3 import PPO
from backend.env.riftbound_env import RiftboundEnv
import os

def train():
    log_dir = "./logs"
    models_dir = "./models"
    
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    print("--- Initializing Riftbound Environment ---")
    env = RiftboundEnv()
    
    # Initialize PPO Agent
    # MlpPolicy is suitable for vector observations
    print("--- Initializing PPO Agent ---")
    model = PPO("MlpPolicy", env, verbose=1, tensorboard_log=log_dir)

    TIMESTEPS = 10000
    print(f"--- Starting Training for {TIMESTEPS} timesteps ---")
    model.learn(total_timesteps=TIMESTEPS)
    
    model_path = f"{models_dir}/riftbound_ppo"
    model.save(model_path)
    print(f"--- Model Saved to {model_path} ---")

if __name__ == "__main__":
    train()
