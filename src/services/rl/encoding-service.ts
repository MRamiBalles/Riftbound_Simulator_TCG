import { SerializedGameState, Action, PlayerId } from '../../game/engine/game.types';
import { RuntimeCard } from '../../game/engine/RuntimeCard';

const KEYWORD_MAP: Record<string, number> = {
    'Rush': 0, 'Barrier': 1, 'Overwhelm': 2, 'Elusive': 3,
    'Tough': 4, 'Regeneration': 5, 'Quick Attack': 6, 'Lifesteal': 7
};

export class EncodingService {
    /**
     * Encodes a GameState into a flat float array for RL.
     * Vector size: ~200
     * @param state - The current game state.
     * @param playerId - The ID of the player for whom to encode the state.
     * @returns A numeric vector representing the game state.
     */
    public static encode(state: SerializedGameState, playerId: PlayerId): number[] {
        const vector: number[] = [];
        const me = state.players[playerId];
        const opponent = state.players[playerId === 'player' ? 'opponent' : 'player'];

        // 1. Global (7)
        vector.push(state.turn / 50); // Normalize turn
        vector.push(state.phase === 'Main' ? 1 : 0);
        vector.push(state.priority === playerId ? 1 : 0);
        vector.push(me.health / 20);
        vector.push(me.mana / 10);
        vector.push(opponent.health / 20);
        vector.push(opponent.mana / 10);

        // 2. My Hand (Max 10 cards * 6 features = 60)
        for (let i = 0; i < 10; i++) {
            const card = me.hand[i];
            if (card) {
                vector.push(...this.encodeCard(card));
            } else {
                vector.push(0, 0, 0, 0, 0, 0);
            }
        }

        // 3. My Field (Max 6 slots * 8 features = 48)
        for (let i = 0; i < 6; i++) {
            const card = me.field[i];
            if (card) {
                vector.push(...this.encodeRuntimeCard(card));
            } else {
                vector.push(0, 0, 0, 0, 0, 0, 0, 0);
            }
        }

        // 4. Opponent Field (Max 6 slots * 8 features = 48)
        for (let i = 0; i < 6; i++) {
            const card = opponent.field[i];
            if (card) {
                vector.push(...this.encodeRuntimeCard(card));
            } else {
                vector.push(0, 0, 0, 0, 0, 0, 0, 0);
            }
        }

        // 5. Opponent Hand count (1)
        vector.push(opponent.hand.length / 10);

        return vector;
    }

    /**
     * Encodes a standard or runtime card into a numeric vector.
     * @param card - The card instance to encode.
     * @returns A float array representing card features.
     */
    private static encodeCard(card: RuntimeCard): number[] {
        return [
            (card.cost || 0) / 10,
            (card.attack || 0) / 10,
            (card.health || 0) / 10,
            card.type === 'Unit' ? 1 : 0,
            card.rarity === 'Champion' ? 1 : 0,
            this.encodeKeywords(card.keywords || [])
        ];
    }

    private static encodeRuntimeCard(card: RuntimeCard): number[] {
        return [
            card.currentCost / 10,
            card.currentAttack / 10,
            card.currentHealth / 10,
            card.hasAttacked ? 1 : 0,
            card.isBarrierActive ? 1 : 0,
            card.summoningSickness ? 1 : 0,
            card.isStunned ? 1 : 0,
            this.encodeKeywords(card.keywords)
        ];
    }

    /**
     * Converts a list of keywords into a normalized bitmask.
     * @param keywords - Array of keyword strings.
     * @returns A normalized [0, 1] float.
     */
    private static encodeKeywords(keywords: string[]): number {
        let mask = 0;
        keywords.forEach(k => {
            if (KEYWORD_MAP[k] !== undefined) {
                mask |= (1 << KEYWORD_MAP[k]);
            }
        });
        return mask / 255; // Normalized bitmask
    }
}

export class ActionSpaceMapper {
    /**
     * Maps a numeric RL action (0-47) to an engine Action.
     */
    public static mapToEngine(index: number, state: SerializedGameState, playerId: PlayerId): Action | null {
        const me = state.players[playerId];

        // 0: PASS
        if (index === 0) return { type: 'PASS', playerId };

        // 1-10: Play Card
        if (index >= 1 && index <= 10) {
            const card = me.hand[index - 1];
            if (!card) return null;
            return { type: 'PLAY_CARD', playerId, cardId: card.instanceId };
        }

        // 11-20: Attack Face (Simplified for now)
        if (index >= 11 && index <= 20) {
            const card = me.field[index - 11];
            if (!card || card.hasAttacked || card.summoningSickness) return null;
            return { type: 'DECLARE_ATTACKERS', playerId, attackers: [card.instanceId] };
        }

        // 21-30: End Turn / Resolve
        if (index === 21) return { type: 'END_TURN', playerId };

        return null;
    }
}
