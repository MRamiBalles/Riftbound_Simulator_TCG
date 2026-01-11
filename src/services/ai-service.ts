import { Action, SerializedGameState } from '../game/engine/game.types';
import { HeuristicBot } from '../game/ai/HeuristicBot';
import { NeuralBot } from '../game/ai/NeuralBot';
import { RemoteBot } from '../game/ai/RemoteBot';

export type AIMode = 'Heuristic' | 'Neural' | 'Hybrid' | 'Remote';

export class AIService {
    private static baseUrl = 'http://localhost:8000';
    private static localBot = new HeuristicBot();
    // private static neuralBot = new NeuralBot(); // Disabled: Missing onnxruntime-web dependency
    private static remoteBot = new RemoteBot();
    private static currentMode: AIMode = 'Heuristic';

    // To store last confidence for visualization
    public static lastConfidence: number[] = [];

    /**
     * Gets a move based on the current AIMode.
     */
    public static async getAction(state: SerializedGameState): Promise<Action | null> {
        if (state.winner) return null;
        // Allow action if it's opponent's turn OR if it's Mulligan phase (simultaneous)
        if (state.activePlayer !== 'opponent' && state.phase !== 'Mulligan') return null;

        let action: Action | null = null;
        let avgConfidence = 0.5;
        let usedNeural = false;

        if (this.currentMode === 'Neural' || this.currentMode === 'Hybrid') {
            console.warn('[AI] NeuralBot is currently disabled. Falling back to Heuristic.');
            action = await this.localBot.decideAction(state);
            usedNeural = false;
            /* 
            const result = await this.neuralBot.decideAction(state);
            avgConfidence = result.confidence.reduce((a, b) => a + b, 0) / (result.confidence.length || 1);

            // HYBRID LOGIC: If confidence is low, fallback to Heuristic
            if (this.currentMode === 'Hybrid' && avgConfidence < 0.45) {
                console.log(`[AI] Neural confidence low (${avgConfidence.toFixed(2)}). Falling back to Heuristic.`);
                action = await this.localBot.decideAction(state);
                usedNeural = false;
            } else {
                action = result.action;
                this.lastConfidence = result.confidence;
                usedNeural = true;
            }
            */
        } else if (this.currentMode === 'Remote') {
            action = await this.remoteBot.decideAction(state);
            if (!action) {
                console.log('[AI] Remote bot failed/timed out. Falling back to Heuristic.');
                action = await this.localBot.decideAction(state);
            }
        } else {
            action = await this.localBot.decideAction(state);
            avgConfidence = 0.6; // Base heuristic confidence
        }

        // --- AI PERSONALITY: Contextual Emotes ---
        if (action) {
            let emote = "";
            if (usedNeural) {
                if (avgConfidence > 0.85) emote = "YOUR DEFEAT IS STATISTICALLY INEVITABLE.";
                else if (avgConfidence > 0.65) emote = "THE RIFT ALIGNS WITH MY PREDICTIONS.";
                else if (avgConfidence < 0.3) emote = "UNFORESEEN VARIABLE DETECTED. RECALIBRATING...";
            } else {
                // Heuristic/Fallback emotes
                emote = "ADAPTING TO BATTLEFIELD VARIABLES.";
            }

            if (emote) {
                console.log(`[AI] "${emote}"`);
                (action as any).emote = emote;
            }
        }

        return action;
    }

    public static setMode(mode: AIMode) {
        this.currentMode = mode;
        console.log(`[AIService] Mode set to ${mode}`);
    }

    public static setDifficulty(level: 'Easy' | 'Medium' | 'Hard') {
        this.localBot.difficulty = level;
    }
}
