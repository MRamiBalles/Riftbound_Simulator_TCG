import torch
import torch.onnx
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from models.tiny_zero import TinyZero

def export_onnx():
    # Fix console encoding for Windows
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')

    print("--- Exporting TinyZero to ONNX (RTIM) ---")
    
    # 1. Load Model
    model_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'models', 'tiny_zero_student.pt')
    output_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'riftbound_brain_v1.onnx')
    
    device = torch.device("cpu") # Export on CPU
    model = TinyZero().to(device)
    
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print("Loaded trained TinyZero student.")
    else:
        print("Warning: Trained weights not found. Exporting initialized model.")
    
    model.eval()
    
    # 2. Define Dummy Input [Batch, Channels, Height, Width]
    # Static batch size of 1 for simplicity and compatibility
    dummy_input = torch.randn(1, 32, 9, 5, device=device)
    
    # 3. Export
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # We remove dynamic_axes to avoid dynamo errors
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14, # 14 is a good balance
        do_constant_folding=True,
        input_names=['input'],
        output_names=['policy', 'value']
    )
    
    print(f"Export Success! Model saved to {output_path}")
    
    # Check size
    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Model Size: {size_mb:.2f} MB (Target < 10 MB)")
    else:
        print("Error: Output file not created.")

if __name__ == "__main__":
    export_onnx()
