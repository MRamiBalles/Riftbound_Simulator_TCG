
import { CoreEngine } from '../src/game/engine/CoreEngine';
import { SerializedGameState, Action } from '../src/game/engine/game.types';
import { EncodingService, ActionSpaceMapper } from '../src/services/rl/encoding-service';
import { DeckFactory } from '../src/services/rl/deck-factory';
import * as readline from 'readline';

/**
 * Headless Bridge for RL Training via Ray/Gymnasium
 * 
 * Protocol (JSON-RPC 2.0 style over stdin/stdout):
 * Request:  { "id": 1, "method": "reset", "params": {} }
 * Response: { "id": 1, "result": { "observation": [...], "info": {...} } }
 */

const engine = new CoreEngine();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let currentPlayer: 'player' | 'opponent' = 'player';

// Helper to send response
function send(id: number | null, result: any = null, error: any = null) {
    console.log(JSON.stringify({ id, result, error }));
}

function handleReset() {
    try {
        const p1Deck = DeckFactory.generateDeck('Random');
        const p2Deck = DeckFactory.generateDeck('Random');

        // Initialize game
        engine.initGame(p1Deck, p2Deck, Math.floor(Math.random() * 100000));

        // Auto-mulligan
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });

        // Get initial observation
        const state = engine.getState();
        const obs = EncodingService.encode(state, currentPlayer);

        return {
            observation: obs,
            info: {
                turn: state.turn,
                phase: state.phase,
                validActions: [] // TODO: Implement getValidActions mask
            }
        };
    } catch (e: any) {
        throw new Error(`Reset failed: ${e.message}`);
    }
}

function handleStep(actionIdx: number) {
    try {
        const state = engine.getState();

        // Check if game already over
        if (state.winner) {
            return {
                observation: EncodingService.encode(state, currentPlayer),
                reward: 0,
                done: true,
                truncated: false,
                info: { winner: state.winner }
            };
        }

        // Map RL action (int) -> Engine Action
        const action = ActionSpaceMapper.mapToEngine(actionIdx, state, currentPlayer);

        let reward = 0;

        if (action) {
            try {
                // Apply action
                engine.applyAction(action);
            } catch (e) {
                // Invalid action penalty?
                reward = -0.1;
            }
        } else {
            // Invalid action mapped (e.g. play card 5 when hand has 3)
            // Just pass or penalize
            reward = -0.01;
            // Force pass to prevent infinite loops if model gets stuck
            engine.applyAction({ type: 'PASS', playerId: currentPlayer });
        }

        const newState = engine.getState();
        const done = !!newState.winner;

        // Calculate reward
        if (done) {
            reward = newState.winner === currentPlayer ? 1.0 : -1.0;
        } else {
            // Shaping rewards (optional)
            // e.g. damage dealt, cards drawn
        }

        const obs = EncodingService.encode(newState, currentPlayer);

        return {
            observation: obs,
            reward,
            done,
            truncated: newState.turn > 100, // Max steps
            info: {}
        };
    } catch (e: any) {
        throw new Error(`Step failed: ${e.message}`);
    }
}

// Main Loop
rl.on('line', (line) => {
    if (!line.trim()) return;

    try {
        const req = JSON.parse(line);
        let response: any;

        switch (req.method) {
            case 'reset':
                response = handleReset();
                break;
            case 'step':
                response = handleStep(req.params.action);
                break;
            case 'ping':
                response = 'pong';
                break;
            default:
                throw new Error(`Unknown method: ${req.method}`);
        }

        send(req.id, response);
    } catch (e: any) {
        send(null, null, e.message);
    }
});

// Signal ready
console.error('Riftbound Bridge Ready');
