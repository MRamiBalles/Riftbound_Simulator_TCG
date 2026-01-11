# -*- coding: utf-8 -*-
"""
Entrenamiento por Destilación de Conocimiento
==============================================

Este script entrena el modelo TinyZero (estudiante) usando los logits
del modelo MuZeroNexus (profesor) como objetivo.

Fundamento teórico:
La destilación de conocimiento (Hinton et al., 2015) transfiere el conocimiento
de un modelo grande a uno pequeño usando "soft targets". La temperatura T
suaviza las distribuciones de probabilidad, exponiendo relaciones entre clases
que los "hard labels" ocultan.

Pérdida de destilación:
    L = α·T²·KL(σ(z_t/T) || σ(z_s/T)) + (1-α)·L_task

Donde:
    - z_t: logits del profesor
    - z_s: logits del estudiante
    - T: temperatura (T=2 por defecto)
    - α: peso de destilación vs tarea original

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import pickle
import os
from models.tiny_zero import TinyZero
from torch.utils.data import DataLoader, Dataset


class DistillationDataset(Dataset):
    """Dataset de pares (observación, logits_profesor, valor_profesor).
    
    Carga datos pre-generados por generate_distillation_data.py.
    """
    def __init__(self, data_path: str):
        with open(data_path, "rb") as f:
            self.data = pickle.load(f)

    def __len__(self) -> int:
        return len(self.data)

    def __getitem__(self, idx: int) -> dict:
        item = self.data[idx]
        return {
            "obs": torch.tensor(item["obs"], dtype=torch.float32),
            "teacher_logits": torch.tensor(item["logits"], dtype=torch.float32),
            "teacher_value": torch.tensor(item["value"], dtype=torch.float32)
        }


class StudentTrainer:
    """Entrenador de destilación para TinyZero.
    
    Carga el dataset de logits del profesor y entrena al estudiante
    para imitar su distribución de probabilidad suavizada.
    """
    def __init__(self, dataset_path: str = "backend/data/distillation_dataset.pkl"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.student = TinyZero().to(self.device)
        self.optimizer = optim.Adam(self.student.parameters(), lr=1e-3)
        
        dataset = DistillationDataset(dataset_path)
        self.dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    def distillation_loss(
        self, 
        student_logits: torch.Tensor, 
        teacher_logits: torch.Tensor, 
        temperature: float = 2.0
    ) -> torch.Tensor:
        """Calcula la divergencia KL entre distribuciones suavizadas.
        
        Args:
            student_logits: Logits del modelo estudiante [B, A]
            teacher_logits: Logits del modelo profesor [B, A]
            temperature: Factor de suavizado (mayor = distribución más uniforme)
        
        Returns:
            Pérdida de destilación escalada por T²
        """
        soft_targets = F.softmax(teacher_logits / temperature, dim=1)
        soft_prob = F.log_softmax(student_logits / temperature, dim=1)
        
        # KLDivLoss espera log-probabilidades como entrada
        loss = F.kl_div(soft_prob, soft_targets, reduction='batchmean') * (temperature ** 2)
        return loss

    def train_epoch(self) -> float:
        """Ejecuta una época de entrenamiento."""
        self.student.train()
        total_loss = 0.0
        
        for batch in self.dataloader:
            obs = batch["obs"].to(self.device)
            t_logits = batch["teacher_logits"].to(self.device)
            t_value = batch["teacher_value"].unsqueeze(1).to(self.device)
            
            self.optimizer.zero_grad()
            
            # Forward del estudiante
            s0 = self.student.representation(obs)
            s_logits, s_value = self.student.prediction(s0)
            
            # Pérdida combinada: destilación de política + MSE de valor
            l_policy = self.distillation_loss(s_logits, t_logits, temperature=2.0)
            l_value = F.mse_loss(s_value, t_value)
            
            loss = l_policy + l_value
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            
        return total_loss / len(self.dataloader)

    def run(self, epochs: int = 10) -> None:
        """Ejecuta el entrenamiento completo."""
        print("Iniciando entrenamiento por destilación (TinyZero)...")
        
        for ep in range(epochs):
            avg_loss = self.train_epoch()
            if ep % 2 == 0:
                print(f"Época {ep} | Pérdida: {avg_loss:.4f}")
        
        # Guardar modelo entrenado
        os.makedirs("backend/models", exist_ok=True)
        torch.save(self.student.state_dict(), "backend/models/tiny_zero_student.pt")
        print("TinyZero guardado en backend/models/tiny_zero_student.pt")


if __name__ == "__main__":
    trainer = StudentTrainer()
    trainer.run(epochs=10)
