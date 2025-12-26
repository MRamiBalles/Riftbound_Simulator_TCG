import { Action, SerializedGameState } from '@/game/engine/game.types';

export type LobbyState = 'IDLE' | 'SEARCHING' | 'CONNECTED' | 'DISCONNECTED';

export interface PVPMessage {
    type: 'ACTION' | 'SYNC' | 'CHAT' | 'EMOTE' | 'READY';
    payload: any;
    from: string;
    timestamp: number;
}

/**
 * Rift Arena: Multiplayer Service
 * Handles the WebSocket bridge for real-time PvP.
 * Uses a modular architecture to support both Mock and Real backends.
 */
export class MultiplayerService {
    private static socket: WebSocket | null = null;
    private static roomId: string | null = null;
    private static onMessageCallback: (msg: PVPMessage) => void = () => { };

    /**
     * Connects to a room for PvP.
     * In a real app, this would use Supabase Realtime or Socket.io.
     */
    public static async joinRoom(id: string, onMessage: (msg: PVPMessage) => void) {
        this.roomId = id;
        this.onMessageCallback = onMessage;
        console.log(`[Multiplayer] Joining Arena: ${id}`);

        // Mock connection success
        this.emit('READY', { status: 'player_ready' });
    }

    /**
     * Sends an action to the opponent.
     */
    public static sendAction(action: Action) {
        this.emit('ACTION', action);
    }

    /**
     * Broadcasts a sync state (usually sent by the 'master' player or server).
     */
    public static syncState(state: SerializedGameState) {
        this.emit('SYNC', state);
    }

    private static emit(type: PVPMessage['type'], payload: any) {
        const msg: PVPMessage = {
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
    public static simulateInbound(msg: PVPMessage) {
        this.onMessageCallback(msg);
    }
}
