"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const HeuristicBot_1 = require("../game/ai/HeuristicBot");
const NeuralBot_1 = require("../game/ai/NeuralBot");
const RemoteBot_1 = require("../game/ai/RemoteBot");
class AIService {
    static baseUrl = 'http://localhost:8000';
    static localBot = new HeuristicBot_1.HeuristicBot();
    static neuralBot = new NeuralBot_1.NeuralBot();
    static remoteBot = new RemoteBot_1.RemoteBot();
    static currentMode = 'Heuristic';
    // To store last confidence for visualization
    static lastConfidence = [];
    /**
     * Gets a move based on the current AIMode.
     */
    static async getAction(state) {
        if (state.winner)
            return null;
        // Allow action if it's opponent's turn OR if it's Mulligan phase (simultaneous)
        if (state.activePlayer !== 'opponent' && state.phase !== 'Mulligan')
            return null;
        let action = null;
        let avgConfidence = 0.5;
        let usedNeural = false;
        if (this.currentMode === 'Neural' || this.currentMode === 'Hybrid') {
            const result = await this.neuralBot.decideAction(state);
            avgConfidence = result.confidence.reduce((a, b) => a + b, 0) / (result.confidence.length || 1);
            // HYBRID LOGIC: If confidence is low, fallback to Heuristic
            if (this.currentMode === 'Hybrid' && avgConfidence < 0.45) {
                console.log(`[AI] Neural confidence low (${avgConfidence.toFixed(2)}). Falling back to Heuristic.`);
                action = await this.localBot.decideAction(state);
                usedNeural = false;
            }
            else {
                action = result.action;
                this.lastConfidence = result.confidence;
                usedNeural = true;
            }
        }
        else if (this.currentMode === 'Remote') {
            action = await this.remoteBot.decideAction(state);
            if (!action) {
                console.log('[AI] Remote bot failed/timed out. Falling back to Heuristic.');
                action = await this.localBot.decideAction(state);
            }
        }
        else {
            action = await this.localBot.decideAction(state);
            avgConfidence = 0.6; // Base heuristic confidence
        }
        // --- AI PERSONALITY: Contextual Emotes ---
        if (action) {
            let emote = "";
            if (usedNeural) {
                if (avgConfidence > 0.85)
                    emote = "YOUR DEFEAT IS STATISTICALLY INEVITABLE.";
                else if (avgConfidence > 0.65)
                    emote = "THE RIFT ALIGNS WITH MY PREDICTIONS.";
                else if (avgConfidence < 0.3)
                    emote = "UNFORESEEN VARIABLE DETECTED. RECALIBRATING...";
            }
            else {
                // Heuristic/Fallback emotes
                emote = "ADAPTING TO BATTLEFIELD VARIABLES.";
            }
            if (emote) {
                // console.log(`[AI] "${emote}"`); // Deprecated simple log
                action.emote = emote;
            }
            // [Sovereign GameOps] Structured Telemetry
            const telemetry = {
                timestamp: Date.now(),
                turn: state.turn,
                phase: state.phase,
                mode: this.currentMode,
                usedNeural,
                meanConfidence: usedNeural ? avgConfidence : null,
                actionType: action.type,
                targetId: action.targetId || action.cardId || null,
                emote
            };
            console.log('[AI_DECISION_TELEMETRY]', JSON.stringify(telemetry));
        }
        return action;
    }
    static setMode(mode) {
        this.currentMode = mode;
        console.log(`[AIService] Mode set to ${mode}`);
    }
    static setDifficulty(level) {
        this.localBot.difficulty = level;
    }
}
exports.AIService = AIService;
