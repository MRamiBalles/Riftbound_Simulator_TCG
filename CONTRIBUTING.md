# Contributing to Riftbound Simulator

First off, thank you for considering contributing to the Riftbound Simulator!

## Code of Conduct
Please be respectful and professional in all communications. We aim to build a high-quality, welcoming environment for developers and TCG players alike.

## Development Workflow
1.  **Fork and Branch**: Create a feature branch from `main`.
2.  **Deterministic Logic**: If you modify the game engine in `src/game/engine`, you **must** also update the corresponding logic in `backend/game_logic.py`.
3.  **State Serializability**: Ensure any new state properties are plain objects and fully serializable.
4.  **Documentation**: Add JSDoc to all new public methods and update `TECHNICAL_GUIDE.md` if necessary.

## Testing
- **Frontend**: Check UI responsiveness and ensure no performance regressions in the virtualized lists.
- **AI**: Verify that the `HeuristicBot` still makes rational decisions after engine changes.
- **Data**: Ensure all card references still resolve to the official `riftbound-data.json`.

## Coding Style
- Use TypeScript for all frontend logic.
- Follow the established "Hextech" UI pattern using Tailwind CSS.
- Keep components small and focused.

## Branch Protection Rules (Recommended)
To ensure the integrity of the `main` branch, we recommend configuring the following Branch Protection Rules in GitHub:

1.  **Require status checks to pass before merging**:
    *   `Build & Test` (The CI workflow we configured)
2.  **Require pull request reviews before merging**:
    *   Minimum number of approving reviews: 1
3.  **Include administrators**: Enforce these rules for admins as well.
4.  **Do not allow bypassing the above settings**.

---
*Happy Coding!*
