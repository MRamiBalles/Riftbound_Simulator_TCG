import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import pickle
import os
from models.tiny_zero import TinyZero
from torch.utils.data import DataLoader, Dataset

class DistillationDataset(Dataset):
    def __init__(self, data_path):
        with open(data_path, "rb") as f:
            self.data = pickle.load(f)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        return {
            "obs": torch.tensor(item["obs"], dtype=torch.float32),
            "teacher_logits": torch.tensor(item["logits"], dtype=torch.float32),
            "teacher_value": torch.tensor(item["value"], dtype=torch.float32)
        }

class StudentTrainer:
    def __init__(self, dataset_path="backend/data/distillation_dataset.pkl"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.student = TinyZero().to(self.device)
        self.optimizer = optim.Adam(self.student.parameters(), lr=1e-3)
        
        # Load Data
        dataset = DistillationDataset(dataset_path)
        self.dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    def distillation_loss(self, student_logits, teacher_logits, T=2.0):
        """
        KL Divergence Loss for Soft Distillation.
        T: Temperature (higher = softer probability distribution)
        """
        soft_targets = F.softmax(teacher_logits / T, dim=1)
        soft_prob = F.log_softmax(student_logits / T, dim=1)
        
        # KLDivLoss expects log_probabilities as input
        loss = F.kl_div(soft_prob, soft_targets, reduction='batchmean') * (T**2)
        return loss

    def train_epoch(self):
        self.student.train()
        total_loss = 0
        
        for batch in self.dataloader:
            obs = batch["obs"].to(self.device)
            t_logits = batch["teacher_logits"].to(self.device)
            t_value = batch["teacher_value"].unsqueeze(1).to(self.device)
            
            self.optimizer.zero_grad()
            
            # Student Forward
            s0 = self.student.representation(obs)
            s_logits, s_value = self.student.prediction(s0)
            
            # Losses
            l_policy = self.distillation_loss(s_logits, t_logits, T=2.0)
            l_value = F.mse_loss(s_value, t_value)
            
            loss = l_policy + l_value
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            
        return total_loss / len(self.dataloader)

    def run(self, epochs=10):
        print(f"Starting Distillation Training (TinyZero)...")
        for ep in range(epochs):
            avg_loss = self.train_epoch()
            if ep % 2 == 0:
                print(f"Epoch {ep} | Distillation Loss: {avg_loss:.4f}")
                
        # Save
        os.makedirs("backend/models", exist_ok=True)
        torch.save(self.student.state_dict(), "backend/models/tiny_zero_student.pt")
        print("TinyZero Student saved.")

if __name__ == "__main__":
    trainer = StudentTrainer()
    trainer.run(epochs=10)
