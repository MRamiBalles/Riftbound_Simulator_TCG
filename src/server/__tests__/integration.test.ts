
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import WebSocket from 'ws';
import { startServer } from '../GameServer';
import { SerializedGameState } from '../../game/engine/game.types';

const TEST_PORT = 8081; // Use a different port for testing

describe('Game Server Integration', () => {
    let server: any;
    let ws1: WebSocket;
    let ws2: WebSocket;

    beforeAll(async () => {
        // Start server
        server = startServer(TEST_PORT);
        // Wait a bit for server to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterAll(() => {
        server.close();
        if (ws1) ws1.close();
        if (ws2) ws2.close();
    });

    it('Should allow two players to connect and assign roles', async () => {
        const p1Promise = new Promise<{ role: string }>((resolve) => {
            ws1 = new WebSocket(`ws://localhost:${TEST_PORT}?room=test1&name=Player1`);
            ws1.on('message', (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.type === 'WELCOME') resolve(data.payload);
            });
        });

        const p2Promise = new Promise<{ role: string }>((resolve) => {
            ws2 = new WebSocket(`ws://localhost:${TEST_PORT}?room=test1&name=Player2`);
            ws2.on('message', (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.type === 'WELCOME') resolve(data.payload);
            });
        });

        const [p1, p2] = await Promise.all([p1Promise, p2Promise]);

        expect(p1.role).toBe('player');
        expect(p2.role).toBe('opponent');
    });

    it('Should sanitize opponent hand for Player 1 (Fog of War)', async () => {
        // Helper to connect and capture first GAME_STATE_UPDATE
        const connectAndGetState = (name: string) => {
            return new Promise<SerializedGameState>((resolve) => {
                const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=fog_room&name=${name}`);
                ws.on('message', (msg) => {
                    const data = JSON.parse(msg.toString());
                    if (data.type === 'GAME_STATE_UPDATE') {
                        resolve(data.payload);
                        ws.close(); // Close after getting state
                    }
                });
            });
        };

        // Connect P1 and P2 concurrently
        const [p1State, p2State] = await Promise.all([
            connectAndGetState('P1'),
            connectAndGetState('P2')
        ]);

        // Validate P1 cannot see P2's hand
        const opponentHand = p1State.players.opponent.hand;
        expect(opponentHand).toBeDefined();
        if (opponentHand.length > 0) {
            opponentHand.forEach(card => {
                expect(card.id).toBe('HIDDEN');
                expect(card.name).toBe('Unknown');
            });
        }

        // Validate P1 CAN see their own hand
        const myHand = p1State.players.player.hand;
        expect(myHand.length).toBeGreaterThan(0);

        myHand.forEach(card => {
            expect(card.id).not.toBe('HIDDEN');
            expect(card.name).not.toBe('Unknown');
        });
    });

    it('Should reject malformed payloads (Schema Validation)', async () => {
        const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=security_test&name=Hacker`);
        await new Promise(resolve => ws.on('open', resolve));
        await new Promise(resolve => ws.once('message', resolve)); // Welcome

        // Send Invalid Payload (Missing 'type')
        const responsePromise = new Promise<any>(resolve => {
            ws.on('message', (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.type === 'ERROR') resolve(data);
            });
        });

        ws.send(JSON.stringify({ payload: { something: 'malicious' } }));

        const response = await responsePromise;
        expect(response.type).toBe('ERROR');
        // Expected error message from Zod or catch block
        // In GameRoom: "Invalid message format" if schema fails.
        // or "Internal Server Error" if crash.
        // IncomingMessageSchema expects { type: "...", payload: ... }
        // Sending { payload: ... } fails at top level check?
        // IncomingMessageSchema is discriminated union.
        // If type is missing, Zod fails.
    });

    it('Should enforce Rate Limiting (Spam Protection)', async () => {
        // ... omitted for brevity in replacement content? No, need full implementation.
        // Simulating spam might be flaky in test environment if time dependent.
        // But RateLimiter is deterministic (token bucket).
        // Sending 70 messages instantly should trigger limit (capacity 60).

        const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=spam_room&name=Spammer`);
        await new Promise(resolve => ws.on('open', resolve));

        let limitHit = false;
        ws.on('message', (msg) => {
            const d = JSON.parse(msg.toString());
            if (d.type === 'ERROR' && d.payload.message === 'Rate limit exceeded') limitHit = true;
        });

        for (let i = 0; i < 70; i++) {
            ws.send(JSON.stringify({ type: 'CHAT', payload: { message: 'spam' } }));
        }

        await new Promise(r => setTimeout(r, 500));
        expect(limitHit).toBe(true);
        ws.close();
    });
});
