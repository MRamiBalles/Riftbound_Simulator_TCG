import { create } from 'zustand';
import { Card } from '@/lib/database.types';
import { CoreEngine } from '@/game/engine/CoreEngine';
import { Action, SerializedGameState, ReplayData } from '@/game/engine/game.types';
import { ReplayService } from '@/services/replay-service';
import { AIService, AIMode } from '@/services/ai-service';
import { MultiplayerService } from '@/services/multiplayer-service';

interface GameStoreState extends SerializedGameState {
    engine: CoreEngine | null;
    isReplayMode: boolean;
    isMultiplayerMode: boolean;
    opponentReady: boolean;
    replayData: ReplayData | null;
    currentReplayIndex: number;
    aiMode: AIMode;
    aiThinking: Record<string, number>;
    winRatePrediction: string | null;

    // Actions
    initGame: (playerDeck: Card[], opponentDeck: Card[]) => void;
    performAction: (action: Action) => void;
    receiveOpponentAction: (action: Action) => void;
    fetchInferenceAction: () => Promise<void>;
    setAIMode: (mode: AIMode) => void;
    setMultiplayerMode: (enabled: boolean, roomId?: string) => void;

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
    seed: 0,
    actionHistory: []
};

export const useGameStore = create<GameStoreState>((set, get) => ({
    ...INITIAL_STATE,
    engine: null,
    isReplayMode: false,
    isMultiplayerMode: false,
    opponentReady: false,
    replayData: null,
    currentReplayIndex: -1,
    aiMode: 'Heuristic',
    aiThinking: {},
    winRatePrediction: null,

    initGame: (playerDeck: Card[], opponentDeck: Card[]) => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);
        set({ engine, isReplayMode: false, ...engine.getState() });
    },

    performAction: (action: Action) => {
        const { engine, isReplayMode, isMultiplayerMode } = get();
        if (!engine || isReplayMode) return;

        if (isMultiplayerMode) {
            MultiplayerService.sendAction(action);
        }

        const newState = engine.applyAction(action);

        // --- SENSORY TRIGGER: Combat Shake ---
        const lastLog = newState.log[newState.log.length - 1] || "";
        if (lastLog.includes('Combat resolved') || lastLog.includes('damage to opponent') || lastLog.includes('damage to player')) {
            window.dispatchEvent(new CustomEvent('RIFTBOUND_SHAKE', { detail: { intensity: 8 } }));
        }

        // --- VISUAL TRIGGER: Damage Floaters ---
        const recentLogs = newState.log.slice(-3);
        recentLogs.forEach(entry => {
            const damageMatch = entry.match(/Dealt (\d+) damage to (.+)/);
            if (damageMatch) {
                const amount = parseInt(damageMatch[1]);
                const targetName = damageMatch[2];
                const isPlayerTarget = targetName === 'player';

                window.dispatchEvent(new CustomEvent('RIFTBOUND_DAMAGE', {
                    detail: {
                        amount,
                        targetId: targetName,
                        isPlayer: isPlayerTarget
                    }
                }));
            }
        });

        set({ ...newState });
    },

    receiveOpponentAction: (action: Action) => {
        const { engine } = get();
        if (!engine) return;
        const newState = engine.applyAction(action);
        set({ ...newState });
    },

    setMultiplayerMode: (enabled: boolean, roomId?: string) => {
        if (enabled && roomId) {
            MultiplayerService.joinRoom(roomId, (msg) => {
                if (msg.type === 'ACTION') {
                    get().receiveOpponentAction(msg.payload);
                }
                if (msg.type === 'READY') {
                    set({ opponentReady: true });
                }
            });
        }
        set({ isMultiplayerMode: enabled });
    },

    setAIMode: (mode: AIMode) => {
        AIService.setMode(mode);
        set({ aiMode: mode });
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
