import { Action, SerializedGameState, PlayerId } from '../engine/game.types';
import { Bot } from './BotInterface';

/**
 * A bot implementation that acts as a proxy to an external Python inference server.
 * Default Endpoint: POST http://localhost:8000/predict
 * 
 * Used for interfacing with complex RL models trained via Stable-Baselines3.
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

    /**
     * Sends the current game state to the external server.
     * Returns the Action dictated by the remote model.
     * 
     * @returns The Action object or null if the server is unreachable (triggers fallback).
     */
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
