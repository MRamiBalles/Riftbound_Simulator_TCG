import torch
import torch.optim as optim
import torch.nn.functional as F
from models.muzero_nexus import MuZeroNexus
from game_gym import RiftboundEnv
import numpy as np

class ProSTTrainer:
    """
    Riftbound ProST (Progressive Spatial Training) Pipeline.
    Implements MuZero Dynamics learning with Adam Reset and L_recon.
    """
    def __init__(self, model: MuZeroNexus):
        self.model = model
        self.optimizer = optim.Adam(model.parameters(), lr=1e-3)
        self.env = RiftboundEnv()

    def adam_reset(self, noise_scale=0.01):
        """
        Implements Expansion Immunity: partial reset of momentum and weights
        to adapt to new card semantics after a patch.
        """
        print("[Adam Reset] Patch detected. Adjusting optimizer states for non-stationarity...")
        for group in self.optimizer.param_groups:
            for p in group['params']:
                state = self.optimizer.state[p]
                if 'exp_avg' in state:
                    # Partial reset: decay current momentum
                    state['exp_avg'].mul_(0.5)
                    state['exp_avg_sq'].mul_(0.5)
        
        # Optional: Add small noise to weights to escape local minima
        with torch.no_grad():
            for p in self.model.parameters():
                p.add_(torch.randn_like(p) * noise_scale)

    def train_step(self, obs, action, next_obs, target_reward):
        self.model.train()
        self.optimizer.zero_grad()
        
        # 1. Representation & Prediction
        s0 = self.model.representation(obs)
        p, v = self.model.prediction(s0)
        
        # 2. Dynamics Prediction
        s1_pred, r_pred = self.model.next_step(s0, action)
        
        # 3. RECONSTRUCTION LOSS (The core of the request)
        o_hat = self.model.reconstruct(s0)
        l_recon = F.mse_loss(o_hat, obs) 
        # Forces latent space s0 to represent physical attributes correctly
        
        # 4. Dynamics & Reward Loss
        # In MuZero, next latent state s1 is trained against s1 from next obs
        with torch.no_grad():
            s1_target = self.model.representation(next_obs)
        
        l_dynamics = F.mse_loss(s1_pred, s1_target)
        l_reward = F.mse_loss(r_pred, target_reward)
        
        # Total Loss
        # We weight L_recon high to prevent 'latent hallucinations'
        total_loss = l_dynamics + l_reward + (1.0 * l_recon)
        
        total_loss.backward()
        self.optimizer.step()
        
        return total_loss.item(), l_recon.item()

    def run_training_loop(self, episodes=10):
        print(f"Starting ProST training loop...")
        for ep in range(episodes):
            obs, info = self.env.reset()
            obs_t = torch.tensor(obs).unsqueeze(0)
            
            terminated = False
            total_l = 0
            while not terminated:
                # Select dummy action for demonstration
                action_idx = np.random.randint(0, 128)
                action_t = torch.tensor([float(action_idx)])
                
                next_obs, reward, terminated, truncated, info = self.env.step(action_idx)
                next_obs_t = torch.tensor(next_obs).unsqueeze(0)
                reward_t = torch.tensor([[float(reward)]])
                
                loss, recon_err = self.train_step(obs_t, action_t, next_obs_t, reward_t)
                total_l += loss
                
                obs_t = next_obs_t
            
            print(f"Episode {ep} | Avg Loss: {total_l:.4f}")

if __name__ == "__main__":
    nexus = MuZeroNexus()
    trainer = ProSTTrainer(nexus)
    
    # Simulate a patch detection
    trainer.adam_reset()
    
    # Run training
    trainer.run_training_loop(episodes=5)
    print("Verification: ProST Loop executed successfully.")
