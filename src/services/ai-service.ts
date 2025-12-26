import { Action, SerializedGameState } from '../game/engine/game.types';
import { HeuristicBot } from '../game/ai/HeuristicBot';

export class AIService {
    private static baseUrl = 'http://localhost:8000';
    private static localBot = new HeuristicBot();

    /**
     * Attempts to get a move from the external inference server.
     * Falls back to the local HeuristicBot if the server is offline or fails.
     */
    public static async getAction(state: SerializedGameState): Promise<Action | null> {
        if (state.activePlayer !== 'opponent' || state.winner) return null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

            const response = await fetch(`${this.baseUrl}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.json();
            }

            throw new Error(`Server returned ${response.status}`);
        } catch (error) {
            console.warn("[AIService] External inference failed, falling back to local heuristic.", error);
            return await this.localBot.decideAction(state);
        }
    }

    /**
     * Sets a new level of difficulty by adjusting heuristic bot parameters (future enhancement).
     */
    public static setDifficulty(level: 'Easy' | 'Medium' | 'Hard') {
        console.log(`[AIService] Difficulty set to ${level}`);
        // For now, HeuristicBot is constant, but we can add variance or "mistakes" for Easy
    }
}
