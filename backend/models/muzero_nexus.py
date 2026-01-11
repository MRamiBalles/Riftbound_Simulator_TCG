import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return F.relu(out)

class RepresentationNetwork(nn.Module):
    """
    h: o_t -> s_t
    Encodes the spatial tensor [32, 9, 5] into a latent state.
    """
    def __init__(self, in_channels=32, latent_channels=64):
        super(RepresentationNetwork, self).__init__()
        self.conv_in = nn.Conv2d(in_channels, latent_channels, kernel_size=3, padding=1)
        self.res1 = ResidualBlock(latent_channels)
        self.res2 = ResidualBlock(latent_channels)

    def forward(self, x):
        x = F.relu(self.conv_in(x))
        x = self.res1(x)
        x = self.res2(x)
        return x # Latent space is [latent_channels, 9, 5]

class DynamicsNetwork(nn.Module):
    """
    g: (s_t, a_t) -> (s_t+1, r_t+1)
    Predicts next latent state and reward.
    """
    def __init__(self, latent_channels=64, action_dim=128):
        super(DynamicsNetwork, self).__init__()
        # We broadcast the action embedding across the spatial grid
        self.action_conv = nn.Conv2d(latent_channels + 1, latent_channels, kernel_size=3, padding=1)
        self.res1 = ResidualBlock(latent_channels)
        self.reward_head = nn.Linear(latent_channels * 9 * 5, 1)

    def forward(self, state, action_onehot):
        # action_onehot: [B, 1] (or embedding)
        # For simple integration, we repeat the action value over a new channel
        B, C, H, W = state.shape
        action_channel = action_onehot.view(B, 1, 1, 1).expand(B, 1, H, W)
        
        x = torch.cat([state, action_channel], dim=1)
        x = F.relu(self.action_conv(x))
        next_state = self.res1(x)
        
        reward = self.reward_head(next_state.view(B, -1))
        return next_state, reward

class ObservationDecoder(nn.Module):
    """
    d: s_t -> o_t_reconstructed
    Decoder for L_recon loss. Prevents latent alucinations.
    Forced to reconstruct physical features (HP, Attack) and Semantic Fingerprints.
    """
    def __init__(self, latent_channels=64, out_channels=32):
        super(ObservationDecoder, self).__init__()
        self.conv1 = nn.Conv2d(latent_channels, latent_channels, kernel_size=3, padding=1)
        self.res1 = ResidualBlock(latent_channels)
        self.conv_out = nn.Conv2d(latent_channels, out_channels, kernel_size=1)

    def forward(self, latent):
        x = F.relu(self.conv1(latent))
        x = self.res1(x)
        out = torch.sigmoid(self.conv_out(x)) # Reconstructing normalized features
        return out

class MuZeroNexus(nn.Module):
    """
    Integrated MuZero architecture for Riftbound.
    Designed for expansion immunity and edge inference.
    """
    def __init__(self, in_channels=32, latent_channels=64, action_dim=128):
        super(MuZeroNexus, self).__init__()
        self.representer = RepresentationNetwork(in_channels, latent_channels)
        self.dynamics = DynamicsNetwork(latent_channels, action_dim)
        self.decoder = ObservationDecoder(latent_channels, in_channels)
        
        # Prediction Network (p, v)
        self.policy_head = nn.Linear(latent_channels * 9 * 5, action_dim)
        self.value_head = nn.Linear(latent_channels * 9 * 5, 1)

    def representation(self, obs):
        return self.representer(obs)

    def prediction(self, state):
        B = state.shape[0]
        flat = state.view(B, -1)
        policy = self.policy_head(flat)
        value = self.value_head(flat)
        return policy, value

    def next_step(self, state, action):
        return self.dynamics(state, action)

    def reconstruct(self, state):
        return self.decoder(state)

if __name__ == "__main__":
    # Test Architecture
    model = MuZeroNexus()
    dummy_obs = torch.randn(1, 32, 9, 5)
    
    # 1. Representation
    s0 = model.representation(dummy_obs)
    print(f"Latent State s0 shape: {s0.shape}")
    
    # 2. Prediction
    p, v = model.prediction(s0)
    print(f"Policy shape: {p.shape}, Value shape: {v.shape}")
    
    # 3. Dynamics
    dummy_action = torch.tensor([5.0]) # Action index 5
    s1, r1 = model.next_step(s0, dummy_action)
    print(f"Next State s1 shape: {s1.shape}, Reward r1: {r1.item():.4f}")
    
    # 4. Reconstruction (The Safety Mechanism)
    o_hat = model.reconstruct(s0)
    print(f"Reconstructed Obs shape: {o_hat.shape}")
    
    # Check model size
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total Parameters: {total_params:,} (~{total_params * 4 / 1e6:.2f} MB as float32)")
