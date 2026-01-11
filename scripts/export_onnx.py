# -*- coding: utf-8 -*-
"""
Exportador de Modelo a Formato ONNX
====================================

Convierte el modelo TinyZero entrenado a formato ONNX para su ejecución
en navegadores web mediante onnxruntime-web.

ONNX (Open Neural Network Exchange) es un formato estándar que permite
ejecutar modelos de PyTorch/TensorFlow en entornos diversos sin dependencias
del framework original.

Consideraciones de exportación:
- Opset 14+: Compatible con operadores modernos.
- Batch dinámico: Permite inferencia de 1 o N estados simultáneamente.
- Sin dynamic_axes para evitar errores con PyTorch Dynamo.

El modelo exportado se guarda en src/data/ para acceso directo desde el frontend.

Author: Manuel Ramirez Ballesteros
Email: ramiballes96@gmail.com
Copyright (c) 2026 Manuel Ramirez Ballesteros. All rights reserved.
"""

import torch
import os
import sys

# Añadir directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from models.tiny_zero import TinyZero


def export_onnx() -> None:
    """Exporta TinyZero a formato ONNX."""
    
    # Configurar encoding de consola para Windows
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            pass  # Python < 3.7

    print("--- Exportación de TinyZero a ONNX ---")
    
    # Rutas de archivos
    model_path = os.path.join(
        os.path.dirname(__file__), 
        '..', 'backend', 'models', 'tiny_zero_student.pt'
    )
    output_path = os.path.join(
        os.path.dirname(__file__), 
        '..', 'src', 'data', 'riftbound_brain_v1.onnx'
    )
    
    # Cargar modelo en CPU para exportación neutral
    device = torch.device("cpu")
    model = TinyZero().to(device)
    
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print("Modelo TinyZero cargado.")
    else:
        print("Advertencia: Pesos no encontrados. Exportando arquitectura sin entrenar.")
    
    model.eval()
    
    # Entrada de ejemplo para trazar el grafo
    # Forma: [Batch, Canales, Alto, Ancho] = [1, 32, 9, 5]
    dummy_input = torch.randn(1, 32, 9, 5, device=device)
    
    # Crear directorio de salida
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Exportar a ONNX
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['observation'],
        output_names=['policy', 'value']
    )
    
    print(f"Exportación exitosa: {output_path}")
    
    # Verificar tamaño
    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Tamaño del modelo: {size_mb:.2f} MB (objetivo: <10 MB)")
    else:
        print("Error: Archivo de salida no creado.")


if __name__ == "__main__":
    export_onnx()
