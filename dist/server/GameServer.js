"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const ws_1 = require("ws");
const GameRoom_1 = require("./GameRoom");
const http_1 = __importDefault(require("http"));
const crypto_1 = __importDefault(require("crypto"));
const PORT = process.env.PORT || 8080;
const rooms = new Map();
function getOrCreateRoom(roomId) {
    if (!rooms.has(roomId)) {
        console.log(`Creating new room: ${roomId}`);
        rooms.set(roomId, new GameRoom_1.GameRoom(roomId));
    }
    return rooms.get(roomId);
}
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200);
    res.end('Riftbound Game Server Running');
});
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const roomId = urlParams.get('room') || 'default';
    const playerName = urlParams.get('name') || 'Anonymous';
    const clientId = crypto_1.default.randomUUID();
    const room = getOrCreateRoom(roomId);
    try {
        const role = room.addClient(ws, clientId, playerName);
        console.log(`New connection: ${clientId} (${playerName}) room: ${roomId} as ${role}`);
        ws.send(JSON.stringify({
            type: 'WELCOME',
            payload: { clientId, role, roomId }
        }));
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                room.handleMessage(clientId, data);
            }
            catch (e) {
                console.error(`Invalid JSON from ${clientId}`);
            }
        });
        ws.on('close', () => {
            console.log(`Client ${clientId} disconnected`);
            room.removeClient(clientId);
        });
    }
    catch (e) {
        console.error(`Connection error for ${clientId}:`, e);
        ws.close();
    }
});
function startServer(port) {
    return server.listen(port, () => {
        console.log(`Game Server listening on port ${port}`);
    });
}
if (require.main === module) {
    startServer(Number(PORT));
}
