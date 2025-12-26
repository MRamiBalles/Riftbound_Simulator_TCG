import { create } from 'zustand';
import { Card } from '@/lib/database.types';
import { CoreEngine } from '@/game/engine/CoreEngine';
import { Action, SerializedGameState } from '@/game/engine/game.types';

interface GameStoreState extends SerializedGameState {
    engine: CoreEngine | null;

    // Actions
    initGame: (playerDeck: Card[], opponentDeck: Card[]) => void;
    performAction: (action: Action) => void;
    fetchInferenceAction: () => Promise<void>;
}

const INITIAL_STATE: SerializedGameState = {
    turn: 0,
    activePlayer: 'player',
    priority: 'player',
    phase: 'End', // Mock initial
    players: {
        player: {
            id: 'player', health: 20, maxHealth: 20, mana: 0, maxMana: 0,
            hand: [], deckCount: 0, field: [], graveyard: []
        },
        opponent: {
            id: 'opponent', health: 20, maxHealth: 20, mana: 0, maxMana: 0,
            hand: [], deckCount: 0, field: [], graveyard: []
        }
    },
    winner: null,
    log: [],
    combat: null,
    stack: []
};

/**
 * Main application store for managing game state and engine interactions.
 * Connects the React UI to the deterministic CoreEngine.
 */
export const useGameStore = create<GameStoreState>((set, get) => ({
    ...INITIAL_STATE,
    engine: null,

    initGame: (playerDeck: Card[], opponentDeck: Card[]) => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);
        set({ engine, ...engine.getState() });
    },

    performAction: (action: Action) => {
        const { engine } = get();
        if (!engine) return;

        const newState = engine.applyAction(action);
        set({ ...newState });
    },

    fetchInferenceAction: async () => {
        const state = get();
        if (state.activePlayer !== 'opponent' || state.winner) return;

        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state })
            });

            if (response.ok) {
                const action = await response.json();
                get().performAction(action);
            }
        } catch (error) {
            console.error("Inference server unreachable, falling back to local heuristic.", error);
        }
    }
}));
