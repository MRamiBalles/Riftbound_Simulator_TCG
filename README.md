# Riftbound Simulator TCG

A high-fidelity simulation and training environment for the **Riftbound TCG**, featuring a deterministic game engine, AI training capabilities, and a modern card management interface.

## 🚀 Overview

Riftbound Simulator is designed to bridge the gap between competitive play and advanced AI development. It provides a pixel-perfect React frontend for playtesting and a Python-powered backend for training reinforcement learning agents using current industry-standard frameworks.

### Key Features
- **Deterministic Game Engine**: Built from the ground up to ensure state parity between TypeScript (UI) and Python (AI).
- **Intelligent AI Opponents**: Includes both a rule-based Heuristic Bot and hooks for Stable-Baselines3 RL agents.
- **Card Management**: Full-featured Deck Builder with advanced filtering, Pack Simulator, and Physical Card Scanner (OCR-ready).
- **Architecture**: Modern Next.js 15+ stack with Zustand for lean state management and Tailwind CSS for a premium "Hextech" aesthetic.

## 🛠️ Tech Stack

### Frontend (Next.js)
- **Framework**: React 19, Next.js 15 (App Router)
- **State Management**: Zustand (Global Store)
- **Styling**: Tailwind CSS 4, Lucide React
- **Logic**: TypeScript 5, CoreEngine (Deterministic State Machine)

### Backend (Python)
- **Framework**: FastAPI (Inference Server)
- **AI/ML**: PyTorch, Gymnasium, Stable-Baselines3
- **Schema**: Shared SerializedGameState for cross-language parity

## 🚦 Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **Python**: 3.10+ (for AI/Backend)

### Installation
1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    cd backend && pip install -r requirements.txt
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Run AI Backend** (Optional):
    ```bash
    cd backend && uvicorn api.main:app --reload
    ```

## 📚 Documentation

For detailed technical insights into the game mechanics, AI integration, and data flow, please refer to the [Technical Guide](./TECHNICAL_GUIDE.md).

---
*Developed for the Riftbound community by Advanced Agentic Coding.*
