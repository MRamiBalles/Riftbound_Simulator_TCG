
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

        // Get initial observation and mask
        const state = engine.getState();
        const obs = EncodingService.encode(state, currentPlayer);
        const mask = ActionSpaceMapper.getActionMask(engine, state, currentPlayer);

        return {
            observation: obs,
            actionMask: mask,
            info: {
                turn: state.turn,
                phase: state.phase,
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
            const finalObs = EncodingService.encode(state, currentPlayer);
            return {
                observation: finalObs,
                actionMask: new Array(48).fill(0),
                reward: 0,
                done: true,
                truncated: false,
                info: { winner: state.winner }
            };
        }

        // Map RL action (int) -> Engine Action
        const action = ActionSpaceMapper.mapToEngine(actionIdx, state, currentPlayer);

        let reward = 0;

        if (action && engine.isActionLegal(action)) {
            try {
                // Apply action
                engine.applyAction(action);
            } catch (e) {
                reward = -0.1;
            }
        } else {
            // Invalid action mapped or illegal move
            reward = -0.05;
            engine.applyAction({ type: 'PASS', playerId: currentPlayer });
        }

        const newState = engine.getState();
        const done = !!newState.winner;

        // Calculate reward
        if (done) {
            reward = newState.winner === currentPlayer ? 1.0 : -1.0;
        } else {
            // SHAPING: Penalty per turn to encourage faster wins
            reward -= 0.001;
        }

        const obs = EncodingService.encode(newState, currentPlayer);
        const mask = ActionSpaceMapper.getActionMask(engine, newState, currentPlayer);

        return {
            observation: obs,
            actionMask: mask,
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
