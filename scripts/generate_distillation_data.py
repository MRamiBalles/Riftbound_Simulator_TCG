import torch
import numpy as np
import os
import sys
import pickle

# Add backend to path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from game_gym import RiftboundEnv
from models.muzero_nexus import MuZeroNexus

def generate_distillation_data(episodes=50, save_path="backend/data/distillation_dataset.pkl"):
    """
    Generates a dataset of (Observation, Logits) pairs from MainAgent_v1 (Teacher).
    Used for distilling the teacher's knowledge into a smaller student model.
    """
    print(f"--- Starting Distillation Data Generation ---")
    
    # 1. Load Teacher
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    teacher = MuZeroNexus().to(device)
    model_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'models', 'muzero_main_v1.pt')
    
    try:
        teacher.load_state_dict(torch.load(model_path, map_location=device))
        teacher.eval()
        print(f"Teacher (MainAgent_v1) loaded successfully from {model_path}.")
    except Exception as e:
        print(f"Error loading teacher from {model_path}: {e}")
        # Build a dummy teacher for pipeline verification if file missing (dev mode)
        # teacher = MuZeroNexus().to(device)
        return

    env = RiftboundEnv()
    dataset = []
    
    # 2. Data Collection Loop
    total_steps = 0
    for ep in range(episodes):
        obs, info = env.reset()
        terminated = False
        steps_ep = 0
        
        while not terminated and steps_ep < 50:
            obs_t = torch.tensor(obs).unsqueeze(0).to(device)
            
            with torch.no_grad():
                # Teacher Inference
                s0 = teacher.representation(obs_t)
                policy_logits, value = teacher.prediction(s0)
                
            # Store (Observation, Logits)
            dataset.append({
                "obs": obs, 
                "logits": policy_logits.cpu().numpy().flatten(),
                "value": value.item()
            })
            
            # Action selection
            probs = torch.softmax(policy_logits, dim=1).cpu().numpy().flatten()
            action_idx = np.random.choice(len(probs), p=probs)
            
            next_obs, reward, terminated, truncated, info = env.step(action_idx)
            obs = next_obs
            steps_ep += 1
            total_steps += 1
            
        if ep % 10 == 0:
            print(f"Episode {ep} | Total Samples: {len(dataset)}")

    # 3. Save Dataset
    abs_save_path = os.path.join(os.path.dirname(__file__), '..', save_path)
    os.makedirs(os.path.dirname(abs_save_path), exist_ok=True)
    with open(abs_save_path, "wb") as f:
        pickle.dump(dataset, f)
        
    print(f"--- Distillation Generation Complete ---")
    print(f"Saved {len(dataset)} samples to {abs_save_path}")

if __name__ == "__main__":
    generate_distillation_data(episodes=50)
