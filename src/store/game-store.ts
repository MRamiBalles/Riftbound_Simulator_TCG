import { create } from 'zustand';
import { Card } from '@/lib/database.types';
import { CoreEngine } from '@/game/engine/CoreEngine';
import { Action, SerializedGameState } from '@/game/engine/game.types';

interface GameStoreState extends SerializedGameState {
    engine: CoreEngine | null;

    // Actions
    initGame: (playerDeck: Card[], opponentDeck: Card[]) => void;
    performAction: (action: Action) => void;
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
    }
}));
