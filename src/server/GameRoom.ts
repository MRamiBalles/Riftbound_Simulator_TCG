
import WebSocket from 'ws';
import { CoreEngine } from '../game/engine/CoreEngine';
import { Action, PlayerId, SerializedGameState } from '../game/engine/game.types';
import { StateSanitizer } from './StateSanitizer';
import { DeckFactory } from '../services/rl/deck-factory';

interface Client {
    ws: WebSocket;
    id: string;
    playerId: PlayerId | 'spectator';
    name: string;
}

export class GameRoom {
    public readonly roomId: string;
    private engine: CoreEngine;
    private clients: Map<string, Client> = new Map();
    private playerSessions: Map<PlayerId, string> = new Map(); // Maps PlayerId -> ClientId

    constructor(roomId: string) {
        this.roomId = roomId;
        this.engine = new CoreEngine();

        // Initialize with default decks for now
        // In production, decks would come from matchmaking payload
        const p1Deck = DeckFactory.generateDeck('Random');
        const p2Deck = DeckFactory.generateDeck('Random');

        this.engine.initGame(p1Deck, p2Deck, Date.now());
    }

    public addClient(ws: WebSocket, clientId: string, name: string): PlayerId | 'spectator' {
        let role: PlayerId | 'spectator' = 'spectator';

        if (!this.playerSessions.has('player')) {
            role = 'player';
            this.playerSessions.set('player', clientId);
        } else if (!this.playerSessions.has('opponent')) {
            role = 'opponent';
            this.playerSessions.set('opponent', clientId);
        }

        const client: Client = { ws, id: clientId, playerId: role, name };
        this.clients.set(clientId, client);

        // Send initial state
        this.sendStateTo(client);

        console.log(`Client ${name} joined room ${this.roomId} as ${role}`);
        return role;
    }

    public removeClient(clientId: string) {
        const client = this.clients.get(clientId);
        if (client) {
            if (client.playerId !== 'spectator') {
                this.playerSessions.delete(client.playerId);
                // Handle disconnect logic (pause game? forfeit timer?)
                console.log(`Player ${client.playerId} disconnected`);
            }
            this.clients.delete(clientId);
        }
    }

    public handleMessage(clientId: string, message: any) {
        const client = this.clients.get(clientId);
        if (!client) return;

        try {
            switch (message.type) {
                case 'ACTION':
                    this.processAction(client, message.payload);
                    break;
                case 'CHAT':
                    // Broadcast chat
                    break;
            }
        } catch (e) {
            console.error(`Error processing message from ${clientId}:`, e);
            this.sendError(client, 'Internal Server Error');
        }
    }

    private processAction(client: Client, action: Action) {
        if (client.playerId === 'spectator') {
            return this.sendError(client, 'Spectators cannot perform actions');
        }

        // 1. Validation: Is it this player's turn?
        const state = this.engine.getState();

        // Basic check, CoreEngine handles specific priority/phase logic
        // But we can add stricter checks here
        if (action.playerId !== client.playerId) {
            return this.sendError(client, 'Identity mismatch in action');
        }

        try {
            // 2. Execution: Apply to Authoritative Engine
            this.engine.applyAction(action);

            // 3. Broadcast: Send updated (sanitized) state to all
            this.broadcastState();
        } catch (e: any) {
            console.warn(`Invalid action by ${client.playerId}:`, e.message);
            this.sendError(client, `Invalid Action: ${e.message}`);
        }
    }

    private broadcastState() {
        const state = this.engine.getState();

        this.clients.forEach(client => {
            if (client.ws.readyState === WebSocket.OPEN) {
                const sanitized = StateSanitizer.sanitize(state, client.playerId === 'spectator' ? 'player' : client.playerId);
                client.ws.send(JSON.stringify({
                    type: 'GAME_STATE_UPDATE',
                    payload: sanitized
                }));
            }
        });
    }

    private sendStateTo(client: Client) {
        if (client.ws.readyState === WebSocket.OPEN) {
            const state = this.engine.getState();
            const sanitized = StateSanitizer.sanitize(state, client.playerId === 'spectator' ? 'player' : client.playerId);
            client.ws.send(JSON.stringify({
                type: 'GAME_STATE_UPDATE',
                payload: sanitized
            }));
        }
    }

    private sendError(client: Client, message: string) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message }
            }));
        }
    }
}
