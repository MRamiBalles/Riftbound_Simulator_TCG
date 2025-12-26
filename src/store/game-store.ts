import { create } from 'zustand';
import { Card } from '@/lib/database.types';
import { CoreEngine } from '@/game/engine/CoreEngine';
import { Action, SerializedGameState } from '@/game/engine/game.types';
import { AIService } from '@/services/ai-service';

interface GameStoreState extends SerializedGameState {
    engine: CoreEngine | null;
    seed: number;
    initialDecks: { player: Card[], opponent: Card[] };

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
    seed: 0,
    initialDecks: { player: [], opponent: [] },

    initGame: (playerDeck: Card[], opponentDeck: Card[]) => {
        const seed = Math.floor(Math.random() * 1000000);
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck, seed);
        set({
            engine,
            seed,
            initialDecks: { player: playerDeck, opponent: opponentDeck },
            ...engine.getState()
        });
    },

    performAction: (action: Action) => {
        const { engine } = get();
        if (!engine) return;

        const newState = engine.applyAction(action);
        set({ ...newState });
    },

    fetchInferenceAction: async () => {
        const state = get();
        const action = await AIService.getAction(state);
        if (action) {
            get().performAction(action);
        }
    }
}));
