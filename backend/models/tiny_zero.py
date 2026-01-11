import torch
import torch.nn as nn
import torch.nn.functional as F

class TinyResBlock(nn.Module):
    def __init__(self, channels):
        super(TinyResBlock, self).__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)

    def forward(self, x):
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        out = out + residual # Non-inplace addition
        return F.relu(out)

class TinyZero(nn.Module):
    """
    TinyZero: Distilled Student Architecture.
    Optimized for RTIM (Low Latency < 20ms).
    Reduced channels (16) and depth (1 ResBlock) compared to Nexus.
    """
    def __init__(self, in_channels=32, latent_channels=16, action_dim=128):
        super(TinyZero, self).__init__()
        
        # Representation: H -> S
        # Input is still 32 channels [32, 9, 5]
        self.representer = nn.Sequential(
            nn.Conv2d(in_channels, latent_channels, kernel_size=3, padding=1),
            nn.ReLU(),
            TinyResBlock(latent_channels)
        )
        
        # Dynamics: S, A -> S', R
        self.action_conv = nn.Conv2d(latent_channels + 1, latent_channels, kernel_size=3, padding=1)
        self.dynamics_res = TinyResBlock(latent_channels)
        self.reward_head = nn.Linear(latent_channels * 9 * 5, 1)
        
        # Prediction: S -> P, V
        self.policy_head = nn.Linear(latent_channels * 9 * 5, action_dim)
        self.value_head = nn.Linear(latent_channels * 9 * 5, 1)

    def forward(self, obs):
        # Combined forward pass for ONNX export (Raw Policy Inference)
        # Input: Observation [B, 32, 9, 5]
        # Output: Policy [B, 128], Value [B, 1]
        s = self.representation(obs)
        p, v = self.prediction(s)
        return p, v

    def representation(self, obs):
        return self.representer(obs)

    def prediction(self, state):
        B = state.shape[0]
        flat = state.view(B, -1)
        policy = self.policy_head(flat)
        value = self.value_head(flat)
        return policy, value

    def next_step(self, state, action_onehot):
        B, C, H, W = state.shape
        action_channel = action_onehot.view(B, 1, 1, 1).expand(B, 1, H, W)
        x = torch.cat([state, action_channel], dim=1)
        x = F.relu(self.action_conv(x))
        next_state = self.dynamics_res(x)
        reward = self.reward_head(next_state.view(B, -1))
        return next_state, reward

if __name__ == "__main__":
    model = TinyZero()
    print(f"TinyZero instantiated. Params: {sum(p.numel() for p in model.parameters())}")
