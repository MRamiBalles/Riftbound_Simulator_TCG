# Riftbound Simulator: Technical Guide

## 1. Game Engine Architecture
The engine uses a deterministic, serialized state machine implemented in `CoreEngine.ts`.

### State Management
- **Serialized State**: The entire game state can be serialized to JSON, allowing for snapshots, undo/redo, and easy sync with the Python backend.
- **Priority System**: Follows a standard TCG priority loop. Actions can only be applied by the player who has priority.

### Mechanics Implementation
- **Keywords**:
  - `Rush`: Units can attack on the turn they are played.
  - `Barrier`: Negates the next instance of damage. Pop logic is handled in `CombatResolver`.
  - `Quick Attack`: Attacker strikes before the defender in unit combat.
  - `Overwhelm`: Excess combat damage is dealt to the opposing Nexus.

## 2. AI & Backend Integration
The project maintains parity between the TypeScript engine (`CoreEngine.ts`) and the Python logic (`game_logic.py`).

### Training Workflow
1.  **Environment**: The Python backend uses `Gymnasium` to expose the game as an RL environment.
2.  **Learning**: `Stable-Baselines3` agents learn by playing against themselves or heuristic bots.
3.  **Inference**: Trained models can be served via the FastAPI backend to provide intelligent opponents in the frontend.

## 3. Data Flow
- **Scraping**: `scrape-riftbound-cards.js` pulls official data from `riftbound.gg`.
- **Syncing**: `sync-cards.js` normalizes API data into `riftbound-data.json`.
- **Hydration**: `starter-decks.ts` hydrates static deck definitions using the full card database.

---
*Created by Antigravity for the Riftbound Development Team.*
