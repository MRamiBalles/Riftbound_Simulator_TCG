
import WebSocket, { WebSocketServer } from 'ws';
import { GameRoom } from './GameRoom';
import http from 'http';
import crypto from 'crypto';

const PORT = process.env.PORT || 8080;
const rooms: Map<string, GameRoom> = new Map();

function getOrCreateRoom(roomId: string): GameRoom {
    if (!rooms.has(roomId)) {
        console.log(`Creating new room: ${roomId}`);
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

    const room = getOrCreateRoom(roomId);

    try {
        const role = room.addClient(ws, clientId, playerName);
        console.log(`New connection: ${clientId} (${playerName}) room: ${roomId} as ${role}`);

        ws.send(JSON.stringify({
            type: 'WELCOME',
            payload: { clientId, role, roomId }
        }));

        ws.on('message', (message: any) => {
            try {
                const data = JSON.parse(message.toString());
                room.handleMessage(clientId, data);
            } catch (e) {
                console.error(`Invalid JSON from ${clientId}`);
            }
        });

        ws.on('close', () => {
            console.log(`Client ${clientId} disconnected`);
            room.removeClient(clientId);
        });

    } catch (e) {
        console.error(`Connection error for ${clientId}:`, e);
        ws.close();
    }
});

export function startServer(port: number) {
    return server.listen(port, () => {
        console.log(`Game Server listening on port ${port}`);
    });
}

if (require.main === module) {
    startServer(Number(PORT));
}
