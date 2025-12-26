# ⚔️ Riftbound Simulator TCG (Sovereign Release)

**Riftbound Simulator** is an enterprise-grade TCG ecosystem designed for both players and AI researchers. It features a high-fidelity, sensory-rich web interface powered by a deterministic game engine, integrated with a Deep Reinforcement Learning pipeline.

## 🌟 Sovereign Features
- **Deterministic Game Engine**: 100% serializable state, enabling bit-perfect replays and AI training.
- **Neural AI Hub**: Real-time in-browser ONNX inference with "AI Vision" strategic heatmaps.
- **Hybrid Persistence**: Cloud-synced decks and collections (Supabase) with seamless offline fallback.
- **Rift Arena**: Live WebSocket PvP with global matchmaking and spectator modes.
- **RL Data Pipeline**: Headless simulation harness capable of 500+ games per minute.
- **Sensory Excellence**: Hextech glassmorphism, region-reactive weather VFX, and 3D card physics.

## 🗺️ The 13-Phase Evolution
1.  **Phase 1**: Core Deterministic Engine & Mechanics.
2.  **Phase 2-3**: High-Fidelity Hextech UI & Audio.
3.  **Phase 4**: Persistence & Collection Hub (LocalStorage).
4.  **Phase 5-6**: Multi-Protocol AI & Visual transitions.
5.  **Phase 7**: RL Data Factory & State Vectorization.
6.  **Phase 8**: Replay Theater & URL Serialization.
7.  **Phase 9**: Neural Evolution (In-browser ONNX).
8.  **Phase 10**: The Cloud Armory (Supabase Scaling).
9.  **Phase 11**: Rift Arena (Live WebSocket PvP).
10. **Phase 12**: Galactic Expansion (Weather VFX & Personality).
11. **Phase 13**: Sovereign Release (Mobile & Optimization).

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion.
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Realtime).
- **AI/ML**: Python (Stable Baselines3), ONNX Runtime, FastAPI.
- **State Management**: Zustand (Multi-store architecture).

## 🚀 Getting Started
```bash
# Clone the repository
git clone https://github.com/Manu/resonant-curie.git

# Install dependencies
npm install

# Start the lab
npm run dev
```

## 🧪 AI Research Guide
The `backend/agent/` directory contains the RL training scripts. You can export current game states as tensors to train your own models using the `HeadlessSimulator`.

---
*Developed by Antigravity & Peer Collaborators. Ascended to Version 1.0.0 (Alpha-Omega)* 🌌✨🏁
