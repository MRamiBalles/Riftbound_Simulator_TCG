import { Action, SerializedGameState, PlayerId } from '../engine/game.types';
import { Bot } from './BotInterface';

/**
 * A bit that communicates with an external Python inference server.
 * Default URL: http://localhost:8000
 */
export class RemoteBot implements Bot {
    id: PlayerId;
    name: string;
    baseUrl: string;

    constructor(id: PlayerId = 'opponent', name: string = 'Python Mind', baseUrl: string = 'http://localhost:8000') {
        this.id = id;
        this.name = name;
        this.baseUrl = baseUrl;
    }

    async decideAction(gameState: SerializedGameState): Promise<Action | null> {
        try {
            const response = await fetch(`${this.baseUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state: gameState })
            });

            if (!response.ok) {
                console.warn(`[RemoteBot] Server returned ${response.status}`);
                return null;
            }

            const action = await response.json();

            // Validate basic action structure
            if (action && action.type) {
                console.log(`[RemoteBot] received action: ${action.type}`);
                return action;
            }
            return null;
        } catch (error) {
            console.error('[RemoteBot] Connection failed:', error);
            return null;
        }
    }
}
