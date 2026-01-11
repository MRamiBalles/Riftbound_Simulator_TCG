# -*- coding: utf-8 -*-
"""
Generador de Datos para Destilación de Conocimiento
====================================================

Genera un dataset de pares (observación, logits) ejecutando partidas con
el modelo profesor (MainAgent). Los logits capturan la "opinión suave" del
modelo antes de seleccionar una acción.

Este dataset se usa posteriormente en train_student.py para entrenar
el modelo TinyZero mediante destilación.

Proceso:
1. Cargar el modelo profesor (MainAgent).
2. Ejecutar N episodios de juego.
3. En cada turno, guardar la observación y los logits del profesor.
4. Serializar el dataset a formato pickle para carga eficiente.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import torch
import numpy as np
import os
import sys
import pickle

# Añadir directorio backend al path para imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from game_gym import RiftboundEnv
from models.muzero_nexus import MuZeroNexus


def generate_distillation_data(
    episodes: int = 50, 
    save_path: str = "backend/data/distillation_dataset.pkl"
) -> None:
    """Genera dataset de destilación desde el modelo profesor.
    
    Args:
        episodes: Número de partidas a jugar
        save_path: Ruta donde guardar el dataset
    """
    print("--- Generación de Datos de Destilación ---")
    
    # Configurar dispositivo
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Cargar modelo profesor
    teacher = MuZeroNexus().to(device)
    model_path = os.path.join(
        os.path.dirname(__file__), 
        '..', 'backend', 'models', 'muzero_main_v1.pt'
    )
    
    try:
        teacher.load_state_dict(torch.load(model_path, map_location=device))
        teacher.eval()
        print(f"Profesor (MainAgent) cargado desde {model_path}")
    except Exception as e:
        print(f"Error cargando profesor: {e}")
        return

    # Inicializar entorno y buffer de datos
    env = RiftboundEnv()
    dataset = []
    
    # Bucle de recolección
    for ep in range(episodes):
        obs, info = env.reset()
        terminated = False
        steps_ep = 0
        
        while not terminated and steps_ep < 50:
            obs_t = torch.tensor(obs).unsqueeze(0).to(device)
            
            with torch.no_grad():
                # Inferencia del profesor
                s0 = teacher.representation(obs_t)
                policy_logits, value = teacher.prediction_net(s0)
            
            # Guardar muestra
            dataset.append({
                "obs": obs,
                "logits": policy_logits.cpu().numpy().flatten(),
                "value": value.item()
            })
            
            # Seleccionar acción (muestreo desde distribución del profesor)
            probs = torch.softmax(policy_logits, dim=1).cpu().numpy().flatten()
            action_idx = np.random.choice(len(probs), p=probs)
            
            next_obs, reward, terminated, truncated, info = env.step(action_idx)
            obs = next_obs
            steps_ep += 1
        
        if ep % 10 == 0:
            print(f"Episodio {ep} | Muestras totales: {len(dataset)}")

    # Guardar dataset
    abs_save_path = os.path.join(os.path.dirname(__file__), '..', save_path)
    os.makedirs(os.path.dirname(abs_save_path), exist_ok=True)
    
    with open(abs_save_path, "wb") as f:
        pickle.dump(dataset, f)
    
    print(f"--- Generación Completada ---")
    print(f"Guardadas {len(dataset)} muestras en {abs_save_path}")


if __name__ == "__main__":
    # Generar dataset de 50 episodios (demo)
    generate_distillation_data(episodes=50)
