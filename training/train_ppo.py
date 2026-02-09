
import ray
from ray import tune
from ray.rllib.algorithms.ppo import PPOConfig
from riftbound_env import RiftboundEnv

def train_riftbound():
    # Initialize Ray locally
    ray.init(ignore_reinit_error=True)
    
    # Register Environment
    tune.register_env("riftbound_env", lambda config: RiftboundEnv(config))
    
    # Configure PPO Algorithm
    config = (
        PPOConfig()
        .environment(env="riftbound_env")
        .framework("torch")
        .rollouts(
            num_rollout_workers=3,  # Dedicate 3 workers to simulation
            num_envs_per_worker=4   # 4 parallel games per worker
        )
        .training(
            train_batch_size=4000,
            gamma=0.99,
            lr=1e-4, # Slightly higher for large state space
            model={
                "fcnet_hiddens": [512, 512, 256], # Deeper net for 233 cards
                "fcnet_activation": "relu",
            }
        )
        .resources(num_gpus=0) # Dedicated for CPU-based training on K8s
    )
    
    # Build Algorithm
    algo = config.build()
    
    print("Starting training loop...")
    
    for i in range(100):
        result = algo.train()
        print(f"Iteration {i}: mean_reward={result['episode_reward_mean']}")
        
        if i % 10 == 0:
            checkpoint_dir = algo.save()
            print(f"Checkpoint saved at {checkpoint_dir}")
            
    ray.shutdown()

if __name__ == "__main__":
    train_riftbound()
