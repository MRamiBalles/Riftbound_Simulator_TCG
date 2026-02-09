
import WebSocket, { WebSocketServer } from 'ws';
import { GameRoom } from './GameRoom';
import http from 'http';
import crypto from 'crypto';

const PORT = process.env.PORT || 8080;
const rooms: Map<string, GameRoom> = new Map();

function getOrCreateRoom(roomId: string): GameRoom {
    if (!rooms.has(roomId)) {
        console.log(`[DEBUG] Creating new room: ${roomId}`);
        rooms.set(roomId, new GameRoom(roomId));
    }
    return rooms.get(roomId)!;
}

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Riftbound Game Server Running');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const roomId = urlParams.get('room') || 'default';
    const playerName = urlParams.get('name') || 'Anonymous';
    const clientId = crypto.randomUUID();

    console.log(`[DEBUG] Connection established: ${clientId} (${playerName}) room: ${roomId}`);

    const room = getOrCreateRoom(roomId);

    try {
        console.log(`[DEBUG] Calling room.addClient for ${clientId}`);
        const role = room.addClient(ws, clientId, playerName);
        console.log(`[DEBUG] addClient DONE for ${clientId}, role: ${role}`);

        const welcomeMsg = JSON.stringify({
            type: 'WELCOME',
            payload: { clientId, role, roomId }
        });

        console.log(`[DEBUG] Sending WELCOME to ${clientId}`);
        ws.send(welcomeMsg, (err) => {
            if (err) console.error(`[DEBUG] Error sending WELCOME to ${clientId}:`, err);
            else console.log(`[DEBUG] WELCOME sent successfully to ${clientId}`);
        });

        ws.on('message', (message: any) => {
            const raw = message.toString();
            console.log(`[DEBUG] GameServer RECEIVED from ${clientId}: ${raw.substring(0, 50)}`);
            try {
                const data = JSON.parse(raw);
                room.handleMessage(clientId, data);
            } catch (e) {
                console.error(`[DEBUG] JSON error for ${clientId}:`, raw);
            }
        });

        ws.on('close', () => {
            console.log(`[DEBUG] Connection CLOSED for ${clientId}`);
            room.removeClient(clientId);
        });

    } catch (e) {
        console.error(`[DEBUG] FATAL connection error for ${clientId}:`, e);
        ws.close();
    }
});

export function startServer(port: number) {
    return server.listen(port, () => {
        console.log(`[DEBUG] Game Server listening on port ${port}`);
    });
}

if (require.main === module) {
    startServer(Number(PORT));
}
