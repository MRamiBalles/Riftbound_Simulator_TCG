
import WebSocket from 'ws';
import { CoreEngine } from '../game/engine/CoreEngine';
import { Action, PlayerId, SerializedGameState } from '../game/engine/game.types';
import { StateSanitizer } from './StateSanitizer';
import { DeckFactory } from '../services/rl/deck-factory';
import { IncomingMessageSchema } from './schemas';
import { RateLimiter } from './RateLimiter';

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
    private playerSessions: Map<PlayerId, string> = new Map();
    private rateLimiter = new RateLimiter(60, 1); // 60 actions/min

    constructor(roomId: string) {
        this.roomId = roomId;
        this.engine = new CoreEngine();
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
        this.sendStateTo(client);
        return role;
    }

    public removeClient(clientId: string) {
        const client = this.clients.get(clientId);
        if (client) {
            if (client.playerId !== 'spectator') {
                this.playerSessions.delete(client.playerId);
            }
            this.clients.delete(clientId);
        }
    }

    public handleMessage(clientId: string, data: any) {
        const client = this.clients.get(clientId);
        if (!client) return;

        if (!this.rateLimiter.tryConsume(clientId)) {
            console.warn(`Rate limit hit for ${clientId}`);
            return this.sendError(client, 'Rate limit exceeded');
        }

        try {
            const result = IncomingMessageSchema.safeParse(data);
            if (!result.success) {
                return this.sendError(client, 'Invalid message format');
            }

            const message = result.data;
            if (message.type === 'ACTION') {
                this.processAction(client, message.payload as any);
            }
        } catch (e) {
            console.error(`Error in handleMessage for ${clientId}:`, e);
            this.sendError(client, 'Internal Server Error');
        }
    }

    private processAction(client: Client, action: Action) {
        if (client.playerId === 'spectator') return this.sendError(client, 'Spectators cannot perform actions');
        if (action.playerId !== client.playerId) return this.sendError(client, 'Identity mismatch');

        try {
            this.engine.applyAction(action);
            this.broadcastState();
        } catch (e: any) {
            this.sendError(client, e.message);
        }
    }

    private broadcastState() {
        this.clients.forEach(c => this.sendStateTo(c));
    }

    private sendStateTo(client: Client) {
        if (client.ws.readyState === WebSocket.OPEN) {
            const state = this.engine.getState();
            const sanitized = StateSanitizer.sanitize(state, client.playerId === 'spectator' ? 'player' : client.playerId);
            client.ws.send(JSON.stringify({ type: 'GAME_STATE_UPDATE', payload: sanitized }));
        }
    }

    private sendError(client: Client, message: string) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: 'ERROR', payload: { message } }));
        }
    }
}
