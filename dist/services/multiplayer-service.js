"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplayerService = void 0;
/**
 * Rift Arena: Multiplayer Service
 * Handles the WebSocket bridge for real-time PvP.
 * Uses a modular architecture to support both Mock and Real backends.
 */
class MultiplayerService {
    static socket = null;
    static roomId = null;
    static onMessageCallback = () => { };
    /**
     * Connects to a room for PvP.
     * In a real app, this would use Supabase Realtime or Socket.io.
     */
    static async joinRoom(id, onMessage) {
        this.roomId = id;
        this.onMessageCallback = onMessage;
        console.log(`[Multiplayer] Joining Arena: ${id}`);
        // Mock connection success
        this.emit('READY', { status: 'player_ready' });
    }
    /**
     * Sends an action to the opponent.
     */
    static sendAction(action) {
        this.emit('ACTION', action);
    }
    /**
     * Broadcasts a sync state (usually sent by the 'master' player or server).
     */
    static syncState(state) {
        this.emit('SYNC', state);
    }
    static emit(type, payload) {
        const msg = {
            type,
            payload,
            from: 'local-user',
            timestamp: Date.now()
        };
        console.log(`[Multiplayer] Outbound: ${type}`, payload);
        // This would be substituted with real socket.send()
    }
    /**
     * Mock-receives a message (for development/testing).
     */
    static simulateInbound(msg) {
        this.onMessageCallback(msg);
    }
}
exports.MultiplayerService = MultiplayerService;
