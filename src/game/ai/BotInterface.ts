import { Action, SerializedGameState } from '../engine/game.types';

export interface Bot {
    id: string;
    name: string;
    decideAction(gameState: SerializedGameState): Promise<Action | null>;
}
