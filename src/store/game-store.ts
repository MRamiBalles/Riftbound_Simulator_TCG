import { create } from 'zustand';
import { Card } from '@/lib/database.types';
import { CoreEngine } from '@/game/engine/CoreEngine';
import { Action, SerializedGameState } from '@/game/engine/game.types';
import { AIService } from '@/services/ai-service';

interface GameStoreState extends SerializedGameState {
    engine: CoreEngine | null;
    isReplayMode: boolean;
    replayData: ReplayData | null;
    currentReplayIndex: number;

    // Actions
    initGame: (playerDeck: Card[], opponentDeck: Card[]) => void;
    performAction: (action: Action) => void;
    fetchInferenceAction: () => Promise<void>;

    // Replay Actions
    loadReplay: (data: ReplayData) => void;
    stepReplay: (delta: number) => void;
    seekReplay: (index: number) => void;
}

const INITIAL_STATE: SerializedGameState = {
    turn: 0,
    activePlayer: 'player',
    priority: 'player',
    phase: 'End',
    players: {
        player: { id: 'player', health: 20, maxHealth: 20, mana: 0, maxMana: 0, hand: [], deckCount: 0, field: [], graveyard: [] },
        opponent: { id: 'opponent', health: 20, maxHealth: 20, mana: 0, maxMana: 0, hand: [], deckCount: 0, field: [], graveyard: [] }
    },
    winner: null,
    log: [],
    combat: null,
    stack: [],
    actionHistory: []
};

import { ReplayData } from '@/game/engine/game.types';
import { ReplayService } from '@/services/replay-service';

export const useGameStore = create<GameStoreState>((set, get) => ({
    ...INITIAL_STATE,
    engine: null,
    isReplayMode: false,
    replayData: null,
    currentReplayIndex: -1,

    initGame: (playerDeck: Card[], opponentDeck: Card[]) => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);
        set({ engine, isReplayMode: false, ...engine.getState() });
    },

    performAction: (action: Action) => {
        const { engine, isReplayMode } = get();
        if (!engine || isReplayMode) return;

        const newState = engine.applyAction(action);
        set({ ...newState });
    },

    loadReplay: (data: ReplayData) => {
        const engine = ReplayService.createPlaybackEngine(data, -1);
        set({
            engine,
            isReplayMode: true,
            replayData: data,
            currentReplayIndex: -1,
            ...engine.getState()
        });
    },

    stepReplay: (delta: number) => {
        const { replayData, currentReplayIndex } = get();
        if (!replayData) return;
        const target = Math.min(replayData.actions.length - 1, Math.max(-1, currentReplayIndex + delta));
        get().seekReplay(target);
    },

    seekReplay: (index: number) => {
        const { replayData } = get();
        if (!replayData) return;
        const engine = ReplayService.createPlaybackEngine(replayData, index);
        set({
            engine,
            currentReplayIndex: index,
            ...engine.getState()
        });
    },

    fetchInferenceAction: async () => {
        const state = get();
        if (state.isReplayMode) return;
        const action = await AIService.getAction(state);
        if (action) get().performAction(action);
    }
}));
