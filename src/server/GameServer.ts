
import WebSocket, { WebSocketServer } from 'ws';
import { GameRoom } from './GameRoom';
import http from 'http';

const PORT = process.env.PORT || 8080;

// Simple in-memory room storage
const rooms: Map<string, GameRoom> = new Map();

// Helper to get or create a room
function getOrCreateRoom(roomId: string): GameRoom {
    if (!rooms.has(roomId)) {
        console.log(`Creating new room: ${roomId}`);
        rooms.set(roomId, new GameRoom(roomId));
    }
    return rooms.get(roomId)!;
}

// Create HTTP server (for health checks / upgrades)
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Riftbound Game Server Running');
});

// Attach WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const roomId = urlParams.get('room') || 'default';
    const playerName = urlParams.get('name') || 'Anonymous';
    const clientId = crypto.randomUUID();

    console.log(`New connection: ${clientId} (${playerName}) requesting room ${roomId}`);

    const room = getOrCreateRoom(roomId);

    // Add client to room
    try {
        const role = room.addClient(ws, clientId, playerName);

        ws.send(JSON.stringify({
            type: 'WELCOME',
            payload: {
                clientId,
                role,
                roomId
            }
        }));

        ws.on('message', (message: string) => {
            try {
                const data = JSON.parse(message.toString());
                room.handleMessage(clientId, data);
            } catch (e) {
                console.error('Invalid JSON received:', message);
            }
        });

        ws.on('close', () => {
            console.log(`Client ${clientId} disconnected`);
            room.removeClient(clientId);
        });

        ws.on('error', (err) => {
            console.error(`WebSocket error for ${clientId}:`, err);
        });

    } catch (e) {
        console.error('Connection handling error:', e);
        ws.close();
    }
});

server.listen(PORT, () => {
    console.log(`Game Server listening on port ${PORT}`);
});
