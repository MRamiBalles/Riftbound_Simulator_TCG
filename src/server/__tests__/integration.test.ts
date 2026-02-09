
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import { startServer } from '../GameServer';
import { SerializedGameState } from '../../game/engine/game.types';

const TEST_PORT = 8081;

describe('Game Server Integration', () => {
    let server: any;

    beforeAll(async () => {
        server = startServer(TEST_PORT);
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterAll(() => {
        server.close();
    });

    it('Should allow two players to connect and assign roles', async () => {
        const connect = (name: string) => new Promise<any>((resolve) => {
            const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=test1&name=${name}`);
            ws.on('message', (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.type === 'WELCOME') resolve(data.payload);
            });
        });

        const [p1, p2] = await Promise.all([connect('P1'), connect('P2')]);
        const roles = new Set([p1.role, p2.role]);
        expect(roles.has('player')).toBe(true);
        expect(roles.has('opponent')).toBe(true);
    });

    it('Should sanitize opponent hand (Fog of War)', async () => {
        const connectAndGetState = (name: string, room: string) => {
            return new Promise<SerializedGameState>((resolve) => {
                const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=${room}&name=${name}`);
                ws.on('message', (msg) => {
                    const data = JSON.parse(msg.toString());
                    if (data.type === 'GAME_STATE_UPDATE') {
                        resolve(data.payload);
                        ws.close();
                    }
                });
            });
        };

        const [p1State] = await Promise.all([
            connectAndGetState('P1', 'fog_room'),
            connectAndGetState('P2', 'fog_room')
        ]);

        const opponentHand = p1State.players.opponent.hand;
        expect(opponentHand).toBeDefined();
        if (opponentHand.length > 0) {
            opponentHand.forEach(card => expect(card.id).toBe('HIDDEN'));
        }
    });

    it('Should reject malformed payloads (Schema Validation)', async () => {
        const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=security_test&name=Hacker`);

        // Wait for WELCOME and then send garbage
        const errorPromise = new Promise<any>((resolve) => {
            ws.on('message', (msg) => {
                const data = JSON.parse(msg.toString());
                if (data.type === 'WELCOME') {
                    ws.send(JSON.stringify({ some_garbage: true }));
                } else if (data.type === 'ERROR') {
                    resolve(data);
                }
            });
        });

        const error = await errorPromise;
        expect(error.type).toBe('ERROR');
        expect(error.payload.message).toBe('Invalid message format');
        ws.close();
    });

    it('Should enforce Rate Limiting (Spam Protection)', async () => {
        const ws = new WebSocket(`ws://localhost:${TEST_PORT}?room=spam_room&name=Spammer`);

        const limitPromise = new Promise<void>((resolve) => {
            ws.on('open', () => {
                for (let i = 0; i < 70; i++) {
                    ws.send(JSON.stringify({ type: 'CHAT', payload: { message: 'spam' } }));
                }
            });
            ws.on('message', (msg) => {
                const d = JSON.parse(msg.toString());
                if (d.type === 'ERROR' && d.payload.message === 'Rate limit exceeded') {
                    resolve();
                }
            });
        });

        await limitPromise;
        ws.close();
    });
});
