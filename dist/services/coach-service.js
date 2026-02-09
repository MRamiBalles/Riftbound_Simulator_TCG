"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachService = void 0;
/**
 * AI Strategic Coach Service
 * Provides NLP-driven rationale for game state optimization.
 */
class CoachService {
    static getAdvice(state) {
        const player = state.players.player;
        const opponent = state.players.opponent;
        if (player.health < 5) {
            return {
                suggestion: "Prioritize Defense",
                rationale: "Your Link energy is critical. Trading your field units to block potential damage is mathematically superior to an all-out strike right now.",
                confidence: 0.94
            };
        }
        if (player.mana >= 8 && player.hand.length > 3) {
            return {
                suggestion: "Aggressive Expansion",
                rationale: "You have significant mana reserves. Deploying high-cost Champions now will force the opponent into a defensive stance they cannot sustain.",
                confidence: 0.88
            };
        }
        return {
            suggestion: "Calculated Attrition",
            rationale: "The board is stable. Conserve your advanced spells for a game-ending combo while chipping away at the opponent's front line.",
            confidence: 0.72
        };
    }
}
exports.CoachService = CoachService;
