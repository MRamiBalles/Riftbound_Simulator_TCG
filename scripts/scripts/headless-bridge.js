"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const CoreEngine_1 = require("../src/game/engine/CoreEngine");
const encoding_service_1 = require("../src/services/rl/encoding-service");
const deck_factory_1 = require("../src/services/rl/deck-factory");
const readline = __importStar(require("readline"));
/**
 * Headless Bridge for RL Training via Ray/Gymnasium
 *
 * Protocol (JSON-RPC 2.0 style over stdin/stdout):
 * Request:  { "id": 1, "method": "reset", "params": {} }
 * Response: { "id": 1, "result": { "observation": [...], "info": {...} } }
 */
const engine = new CoreEngine_1.CoreEngine();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
let currentPlayer = 'player';
// Helper to send response
function send(id, result = null, error = null) {
    console.log(JSON.stringify({ id, result, error }));
}
function handleReset() {
    try {
        const p1Deck = deck_factory_1.DeckFactory.generateDeck('Random');
        const p2Deck = deck_factory_1.DeckFactory.generateDeck('Random');
        // Initialize game
        engine.initGame(p1Deck, p2Deck, Math.floor(Math.random() * 100000));
        // Auto-mulligan
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });
        // Get initial observation
        const state = engine.getState();
        const obs = encoding_service_1.EncodingService.encode(state, currentPlayer);
        return {
            observation: obs,
            info: {
                turn: state.turn,
                phase: state.phase,
                validActions: [] // TODO: Implement getValidActions mask
            }
        };
    }
    catch (e) {
        throw new Error(`Reset failed: ${e.message}`);
    }
}
function handleStep(actionIdx) {
    try {
        const state = engine.getState();
        // Check if game already over
        if (state.winner) {
            return {
                observation: encoding_service_1.EncodingService.encode(state, currentPlayer),
                reward: 0,
                done: true,
                truncated: false,
                info: { winner: state.winner }
            };
        }
        // Map RL action (int) -> Engine Action
        const action = encoding_service_1.ActionSpaceMapper.mapToEngine(actionIdx, state, currentPlayer);
        let reward = 0;
        if (action) {
            try {
                // Apply action
                engine.applyAction(action);
            }
            catch (e) {
                // Invalid action penalty?
                reward = -0.1;
            }
        }
        else {
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
        }
        else {
            // Shaping rewards (optional)
            // e.g. damage dealt, cards drawn
        }
        const obs = encoding_service_1.EncodingService.encode(newState, currentPlayer);
        return {
            observation: obs,
            reward,
            done,
            truncated: newState.turn > 100, // Max steps
            info: {}
        };
    }
    catch (e) {
        throw new Error(`Step failed: ${e.message}`);
    }
}
// Main Loop
rl.on('line', (line) => {
    if (!line.trim())
        return;
    try {
        const req = JSON.parse(line);
        let response;
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
    }
    catch (e) {
        send(null, null, e.message);
    }
});
// Signal ready
console.error('Riftbound Bridge Ready');
