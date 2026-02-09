"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const ws_1 = __importDefault(require("ws"));
const CoreEngine_1 = require("../game/engine/CoreEngine");
const StateSanitizer_1 = require("./StateSanitizer");
const deck_factory_1 = require("../services/rl/deck-factory");
const schemas_1 = require("./schemas");
const RateLimiter_1 = require("./RateLimiter");
class GameRoom {
    roomId;
    engine;
    clients = new Map();
    playerSessions = new Map();
    rateLimiter = new RateLimiter_1.RateLimiter(60, 1); // 60 actions/min
    constructor(roomId) {
        this.roomId = roomId;
        this.engine = new CoreEngine_1.CoreEngine();
        const p1Deck = deck_factory_1.DeckFactory.generateDeck('Random');
        const p2Deck = deck_factory_1.DeckFactory.generateDeck('Random');
        this.engine.initGame(p1Deck, p2Deck, Date.now());
    }
    addClient(ws, clientId, name) {
        let role = 'spectator';
        if (!this.playerSessions.has('player')) {
            role = 'player';
            this.playerSessions.set('player', clientId);
        }
        else if (!this.playerSessions.has('opponent')) {
            role = 'opponent';
            this.playerSessions.set('opponent', clientId);
        }
        const client = { ws, id: clientId, playerId: role, name };
        this.clients.set(clientId, client);
        this.sendStateTo(client);
        return role;
    }
    removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            if (client.playerId !== 'spectator') {
                this.playerSessions.delete(client.playerId);
            }
            this.clients.delete(clientId);
        }
    }
    handleMessage(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client)
            return;
        if (!this.rateLimiter.tryConsume(clientId)) {
            console.warn(`Rate limit hit for ${clientId}`);
            return this.sendError(client, 'Rate limit exceeded');
        }
        try {
            const result = schemas_1.IncomingMessageSchema.safeParse(data);
            if (!result.success) {
                return this.sendError(client, 'Invalid message format');
            }
            const message = result.data;
            if (message.type === 'ACTION') {
                this.processAction(client, message.payload);
            }
        }
        catch (e) {
            console.error(`Error in handleMessage for ${clientId}:`, e);
            this.sendError(client, 'Internal Server Error');
        }
    }
    processAction(client, action) {
        if (client.playerId === 'spectator')
            return this.sendError(client, 'Spectators cannot perform actions');
        if (action.playerId !== client.playerId)
            return this.sendError(client, 'Identity mismatch');
        try {
            this.engine.applyAction(action);
            this.broadcastState();
        }
        catch (e) {
            this.sendError(client, e.message);
        }
    }
    broadcastState() {
        this.clients.forEach(c => this.sendStateTo(c));
    }
    sendStateTo(client) {
        if (client.ws.readyState === ws_1.default.OPEN) {
            const state = this.engine.getState();
            const sanitized = StateSanitizer_1.StateSanitizer.sanitize(state, client.playerId === 'spectator' ? 'player' : client.playerId);
            client.ws.send(JSON.stringify({ type: 'GAME_STATE_UPDATE', payload: sanitized }));
        }
    }
    sendError(client, message) {
        if (client.ws.readyState === ws_1.default.OPEN) {
            client.ws.send(JSON.stringify({ type: 'ERROR', payload: { message } }));
        }
    }
}
exports.GameRoom = GameRoom;
