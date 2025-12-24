import { Bot } from './BotInterface';
import { CoreEngine } from '../engine/CoreEngine';
import { Action, SerializedGameState } from '../engine/game.types';

export class HeuristicBot implements Bot {
    id: string;
    name: string;

    constructor(id: string = 'bot-heuristic', name: string = 'Training Bot') {
        this.id = id;
        this.name = name;
    }

    async decideAction(gameState: SerializedGameState): Promise<Action | null> {
        const engine = new CoreEngine(gameState);
        const legalActions = engine.getLegalActions(this.id as any); // Type cast for flexibility if bot plays as either

        if (legalActions.length === 0) return null;

        // RULE 1: Always attack if possible to pressure
        const attackAction = legalActions.find(a => a.type === 'ATTACK');
        if (attackAction) return attackAction;

        // RULE 2: Play the most expensive card possible (Mana Efficiency)
        const playActions = legalActions.filter(a => a.type === 'PLAY_CARD');
        if (playActions.length > 0) {
            // Find card costs effectively (would need card lookup, but simplified here by random high priority)
            // In real impl, we'd lookup cost. For now, picking the first one is "Greedy" enough
            return playActions[0];
        }

        // RULE 3: End turn if nothing else
        return legalActions.find(a => a.type === 'END_TURN') || null;
    }
}
