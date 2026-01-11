import torch
import torch.nn.functional as F
from models.muzero_nexus import MuZeroNexus
from game_gym import RiftboundEnv
import numpy as np

def verify_hallucination(steps=5):
    print(f"--- MuZero Hallucination Test (Unroll {steps} steps) ---")
    
    # 1. Load Model
    model = MuZeroNexus()
    try:
        model.load_state_dict(torch.load("backend/models/muzero_main_v1.pt"))
        print("Success: MainAgent_v1 loaded.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    model.eval()
    
    # 2. Get Initial State
    env = RiftboundEnv()
    obs, info = env.reset()
    s_current = model.representation(torch.tensor(obs).unsqueeze(0))
    
    print(f"Initial State s0: {s_current.shape}")
    
    # 3. Predict & Unroll
    for t in range(steps):
        # Pick action
        p, v = model.prediction(s_current)
        action_idx = torch.argmax(p[0]).item()
        action_t = torch.tensor([float(action_idx)])
        
        # Step Dynamics
        s_next, r_pred = model.next_step(s_current, action_t)
        
        # Reconstruct Observation from Latent State
        o_recon = model.reconstruct(s_next)
        
        # Check Legality (Generic limit check)
        recon_valid = True
        if torch.max(o_recon) > 1.1 or torch.min(o_recon) < -0.1:
            recon_valid = False # Basic bound check
            
        # Semantic check (Channel 0 should be binary 0 or 1 roughly)
        presence = o_recon[0, 0, :, :] # Channel 0
        presence_valid = torch.all(presence >= -0.1) and torch.all(presence <= 1.1)
        
        print(f"Step {t+1}: Action {action_idx}")
        print(f"  - Reward Pred: {r_pred.item():.4f}")
        print(f"  - Reconstructed Obs Bounds: [{torch.min(o_recon):.2f}, {torch.max(o_recon):.2f}]")
        print(f"  - Presence Channel Valid: {presence_valid}")
        
        s_current = s_next

    print("--- Hallucination Test Complete ---")

if __name__ == "__main__":
    verify_hallucination()
