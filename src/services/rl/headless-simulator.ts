import { CoreEngine } from '../../game/engine/CoreEngine';
import { HeuristicBot } from '../../game/ai/HeuristicBot';
import { DeckFactory } from './deck-factory';
import { EncodingService, ActionSpaceMapper } from './encoding-service';
import { Action, PlayerId, SerializedGameState } from '../../game/engine/game.types';

export interface GameExperience {
    state: number[];
    action: number;
    reward: number;
    next_state: number[];
    done: boolean;
}

export class HeadlessSimulator {
    /**
     * Runs a full game between two bots and returns the trajectory.
     */
    public static async runGame(difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): Promise<GameExperience[]> {
        const engine = new CoreEngine();
        const p1Deck = DeckFactory.generateDeck('Random');
        const p2Deck = DeckFactory.generateDeck('Random');

        engine.initGame(p1Deck, p2Deck);

        // Handle Mulligan
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });

        const bots = {
            'player': new HeuristicBot('player', 'Trainer P1', difficulty, true),
            'opponent': new HeuristicBot('opponent', 'Trainer P2', difficulty, true)
        };

        const trajectory: { state: number[], actionIdx: number, playerId: PlayerId }[] = [];
        let finalExperiences: GameExperience[] = [];

        let turnLimit = 100;
        let turn = 0;

        while (!engine.getState().winner && turn < turnLimit) {
            const state = engine.getState();
            const activeId = state.priority;
            const bot = bots[activeId];

            const action = await bot.decideAction(state);

            if (action) {
                // To record for RL, we need to map this action to its index
                // Note: This is an approximation since HeuristicBot doesn't use the action space directly
                const actionIdx = this.inferActionIndex(action, state);

                trajectory.push({
                    state: EncodingService.encode(state, activeId),
                    actionIdx,
                    playerId: activeId
                });

                engine.applyAction(action);
            } else {
                // If bot has no action, it passes
                engine.applyAction({ type: 'PASS', playerId: activeId });
            }

            turn++;
        }

        const winner = engine.getState().winner;

        // Convert trajectory to experiences with rewards
        for (let i = 0; i < trajectory.length - 1; i++) {
            const item = trajectory[i];
            const nextItem = trajectory[i + 1];

            const reward = winner === item.playerId ? 1 : (winner ? -1 : 0);

            finalExperiences.push({
                state: item.state,
                action: item.actionIdx,
                reward,
                next_state: nextItem.state,
                done: false
            });
        }

        // Final experience
        if (trajectory.length > 0) {
            const last = trajectory[trajectory.length - 1];
            finalExperiences.push({
                state: last.state,
                action: last.actionIdx,
                reward: winner === last.playerId ? 1 : -1,
                next_state: last.state, // Terminal
                done: true
            });
        }

        return finalExperiences;
    }

    /**
     * Heuristic back-mapping of engine action to our discrete RL index.
     * @param action - The engine action performed.
     * @param state - The game state at the time of the action.
     * @returns A discrete action index (0-47).
     */
    private static inferActionIndex(action: Action, state: SerializedGameState): number {
        if (action.type === 'PASS' || action.type === 'END_TURN') return 0;

        if (action.type === 'PLAY_CARD') {
            const hand = state.players[action.playerId].hand;
            const idx = hand.findIndex(c => c.instanceId === action.cardId);
            return idx !== -1 ? idx + 1 : 0;
        }

        if (action.type === 'DECLARE_ATTACKERS' && action.attackers) {
            const field = state.players[action.playerId].field;
            const firstAttackerId = action.attackers[0];
            const idx = field.findIndex(c => c.instanceId === firstAttackerId);
            return idx !== -1 ? idx + 11 : 0;
        }

        return 0; // Fallback
    }
}
