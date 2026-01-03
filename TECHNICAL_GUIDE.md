# Riftbound Simulator: Technical Guide

## 1. Game Engine Architecture
The engine is a purely functional, deterministic state machine implemented in `CoreEngine.ts`. It takes a `SerializedGameState` and an `Action`, returning a new `SerializedGameState`.

### State Parity & Serialization
To facilitate cross-language AI training (TypeScript <-> Python), the state is designed to be fully serializable. Every entity (unit, player, combat instance) is a plain object. This allows the Python backend to rebuild the exact same game world from a JSON snapshot.

### Mechanics Deep-Dive
- **Combat Resolution**: Handled by a specialized `CombatResolver`. Unlike many TCGs, Riftbound resolution considers protection keywords *sequentially* during unit trades:
    1.  **Quick Attack Check**: If the attacker has QA, it applies damage first. If the defender dies, it cannot strike back unless it also has specific keywords.
    2.  **Barrier Interaction**: Barrier negates only the *next* instance of damage. A 0-damage hit (from a 0-attack unit) should not consume Barrier.
    3.  **Overwhelm Calculation**: `Overwhelm` damage accounts for the defender's current HP at the moment of strike, transmitting the remainder directly to the Nexus.

## 2. Store Management (Zustand)
The application uses a modular store architecture:
- `useGameStore`: Orchestrates the `CoreEngine`. It translates React UI events into Engine Actions.
- `useCollectionStore`: Manages persistent user data including the virtual/real inventory and deck configurations.
- `useMissionStore`: Handles dynamic game objectives and progression tracking.

## 3. Intelligent Agents
### HeuristicBot (Rule-Based)
The heuristic bot uses a prioritized decision tree:
1.  **Lethal Check**: Scans for any combination of unblocked units that can reach 0 opponent HP.
2.  **Profitable Trading**: Evaluates blockers using `Barrier` and `Quick Attack` to find "free" trades where the bot unit survives but the player unit dies.
3.  **Mana Efficiency**: Prioritizes playing cards that maximize mana usage each turn.

### RL Integration
### RL Integration
The `backend/game_logic.py` provides a `Gymnasium` environment. The observation space is a flattened vector of the `SerializedGameState`.

### 3.1 Multi-Protocol AI Interface
The `AIService` now supports a **Hybrid-Remote** architecture allowing seamless switching between local and remote intelligence:

- **Local Heuristic**: Runs entirely in-browser. Capable of evaluating "Smart Mulligan" decisions by optimizing for curve (keeping cards <= 3 Mana) while preserving Champions.
- **Remote Neural**: Connects to a Python inference server (default: `localhost:8000`). It sends the `SerializedGameState` and receives an action.
- **Failover Safety**: If the Remote bot fails or times out, the system automatically falls back to the Local Heuristic bot for that turn, ensuring gameplay continuity.

## 4. Advanced Tooling
- **Card Scanner**: Implements an immersive OCR simulation. It utilizes a multi-stage analysis pipeline to match visual inputs against the local high-fidelity database.
- **Deck Builder**: Uses list virtualization to handle thousands of permutations while maintaining 60FPS during search and filtering.

## 5. Sovereign Visual Stack
To achieve "Sovereign" aesthetic fidelity, the frontend employs a layered rendering approach:
- **ImmersiveCard Engine**: A custom React component (`ImmersiveCard.tsx`) utilizing `framer-motion` to map mouse coordinates to 3D CSS transforms (rotateX/Y), simulating physical depth and holographic reflection layers.
- **Event-Driven FX**: 
    - **Damage Floaters**: Triggered via a custom `RIFTBOUND_DAMAGE` event dispatched from the Redux-like store middleware, ensuring visual feedback is decoupled from game logic.
    - **Cinematic Atmosphere**: Weather effects use fractal noise overlays (`SVG feTurbulence`) to create a film-grain aesthetic, consistent with premium production values.

---
*Document Version: 1.1.0 Sovereign | Last Audit: 2026-01-03*
