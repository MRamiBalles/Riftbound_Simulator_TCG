import { Action, SerializedGameState } from '../game/engine/game.types';
import { HeuristicBot } from '../game/ai/HeuristicBot';
import { NeuralBot } from '../game/ai/NeuralBot';

export type AIMode = 'Heuristic' | 'Neural' | 'Hybrid';

export class AIService {
    private static baseUrl = 'http://localhost:8000';
    private static localBot = new HeuristicBot();
    private static neuralBot = new NeuralBot();
    private static currentMode: AIMode = 'Heuristic';

    // To store last confidence for visualization
    public static lastConfidence: number[] = [];

    /**
     * Gets a move based on the current AIMode.
     */
    public static async getAction(state: SerializedGameState): Promise<Action | null> {
        if (state.activePlayer !== 'opponent' || state.winner) return null;

        let action: Action | null = null;
        let avgConfidence = 0.5;

        if (this.currentMode === 'Neural') {
            const result = await this.neuralBot.decideAction(state);
            action = result.action;
            this.lastConfidence = result.confidence;
            avgConfidence = result.confidence.reduce((a, b) => a + b, 0) / result.confidence.length;
        } else {
            action = await this.localBot.decideAction(state);
            avgConfidence = 0.6;
        }

        // --- AI PERSONALITY: Contextual Emotes ---
        if (action) {
            let emote = "";
            if (avgConfidence > 0.8) emote = "YOUR DEFEAT IS STATISTICALLY INEVITABLE.";
            else if (avgConfidence > 0.65) emote = "THE RIFT ALIGNS WITH MY PREDICTIONS.";
            else if (avgConfidence < 0.35) emote = "UNFORESEEN VARIABLE DETECTED. RECALIBRATING...";
            else if (avgConfidence < 0.2) emote = "CRITICAL ERROR IN STRATEGY. ADAPTING...";

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
