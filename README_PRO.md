# 🎮 Riftbound Simulator TCG - Professional Edition

A high-performance, enterprise-grade TCG simulation engine and deck-building suite. This project has been polished to an "A+ Detail" standard, featuring advanced mechanical fidelity, immersive sensory feedback, and persistent user curation.

## 🌟 Premium Features

### 1. Advanced Engine (Phase 1 & 6)
- **Keyword Fidelity**: Full support for `Barrier`, `Overwhelm`, `Tough`, `Regeneration`, `Lifesteal`, and `Quick Attack`.
- **Deterministic combat**: Rigorously tested via `keyword-interactions.test.ts` for zero-bug trades.
- **Spell Stack**: Functional priority management and spell resolution order.

### 2. Sensory Atmosphere (Phase 5)
- **Hextech Sound System**: Spatial audio triggers for all UI and combat events via `SoundService`.
- **Prismatic Champions**: Exclusive "Magic Foil" CSS animations (`prismatic-champion`) for high-rarity units.
- **Region-Themed Auras**: The Game Board dynamically shifts its background gradient based on the dominant region of your field (e.g., Noxus Crimson vs Demacia Gold).
- **Fluid transitions**: Global page animations for a seamless "App-like" experience.

### 3. Collection & Persistence (Phase 4)
- **The Armory**: A persistent dashboard for managing, naming, and curating your deck builds.
- **Deck Sharing Service**: Base64-encoded deck codes for community sharing and instant imports.
- **Pinned Showcase**: A visual gallery for your 9 most prized cards, accessible from the collection hub.

### 4. AI & Strategic Depth (Phase 3 & 6)
- **HeuristicBot v2**: AI that understands trades, saves its health, and scales across `Easy`, `Medium`, and `Hard` difficulties.
- **Advanced AIService**: Built-in hooks for a FastAPI neural-network inference server.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Zustand.
- **Audio**: Web Audio API (Spatialized).
- **Testing**: Jest-ready mechanical verification suite.
- **Storage**: LocalStorage Persistence with State Hydration.

## 🚀 Setup & Execution
1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev`
3. **Execute Engine Tests**: `npm test`

---
*Developed for excellence in Agentic Coding. "Complete All Detailed" - [x]*
