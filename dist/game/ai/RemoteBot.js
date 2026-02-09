"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteBot = void 0;
/**
 * A bot implementation that acts as a proxy to an external Python inference server.
 * Default Endpoint: POST http://localhost:8000/predict
 *
 * Used for interfacing with complex RL models trained via Stable-Baselines3.
 */
class RemoteBot {
    id;
    name;
    baseUrl;
    constructor(id = 'opponent', name = 'Python Mind', baseUrl = 'http://localhost:8000') {
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
    async decideAction(gameState) {
        try {
            // Updated to match backend/main.py endpoint (/act) and expected flattened payload
            const response = await fetch(`${this.baseUrl}/act`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameState) // Simplified payload: Send state as root object
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
        }
        catch (error) {
            console.error('[RemoteBot] Connection failed:', error);
            return null;
        }
    }
}
exports.RemoteBot = RemoteBot;
