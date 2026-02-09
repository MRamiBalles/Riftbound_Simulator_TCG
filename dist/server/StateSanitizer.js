"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSanitizer = void 0;
/**
 * Security component that filters GameState for specific clients.
 * Implements "Fog of War" by removing hidden information.
 */
class StateSanitizer {
    /**
     * Creates a sanitized view of the state for a specific player.
     * @param state The full authoritative game state
     * @param viewerId The player requesting the state
     */
    static sanitize(state, viewerId) {
        // Deep copy to avoid mutating the source of truth
        const sanitized = JSON.parse(JSON.stringify(state));
        const opponentId = viewerId === 'player' ? 'opponent' : 'player';
        const opponent = sanitized.players[opponentId];
        // 1. Hide Opponent's Hand
        // Clients should know HOW MANY cards opponent has, but not WHICH ones.
        opponent.hand = opponent.hand.map(card => this.maskCard(card));
        // 2. Hide Opponent's Deck
        // Deck content should be completely hidden
        opponent.deck = opponent.deck.map(card => this.maskCard(card));
        // 3. Hide Face-down cards on field (if any mechanic exists)
        // Currently field is public info, but good to have the hook
        // opponent.field = opponent.field.map(...)
        // 4. Hide Seed/RNG state
        // Clients should NOT know the seed to prevent predicting RNG
        sanitized.seed = 0; // or a public hash
        return sanitized;
    }
    /**
     * Replaces a card with a generic "Back of Card" placeholder.
     */
    static maskCard(card) {
        return {
            ...card,
            id: 'HIDDEN',
            name: 'Unknown',
            cost: 0,
            type: 'Spell', // Generic type or keep original if public
            text: '',
            image_url: 'assets/card-back.png',
            keywords: [],
            effects: [], // Hide effects
            // Keep minimal structural info if needed for animations
            instanceId: card.instanceId
        };
    }
}
exports.StateSanitizer = StateSanitizer;
