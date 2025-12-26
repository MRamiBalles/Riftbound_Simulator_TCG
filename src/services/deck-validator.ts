import { Card } from '@/lib/database.types';

export interface DeckValidationResult {
    isValid: boolean;
    issues: string[];
    stats: {
        totalCards: number;
        champions: number;
        units: number;
        spells: number;
    };
}

/**
 * Service to validate the legality of a Riftbound TCG deck.
 * Standard rules: 
 * - Exactly 40 cards.
 * - Max 3 copies of any non-basic card.
 * - Max 6 Champion rarity cards.
 */
export class DeckValidator {
    public static validate(cards: Card[]): DeckValidationResult {
        const issues: string[] = [];
        const counts: Record<string, number> = {};

        const stats = {
            totalCards: cards.length,
            champions: 0,
            units: 0,
            spells: 0
        };

        cards.forEach(card => {
            // Count Stats
            if (card.rarity === 'Champion' || card.type === 'Legend' as any) stats.champions++;
            if (card.type === 'Unit') stats.units++;
            if (card.type === 'Spell') stats.spells++;

            // Count copies
            counts[card.id] = (counts[card.id] || 0) + 1;
        });

        // Rule 1: Deck Size
        if (stats.totalCards !== 40) {
            issues.push(`Deck must have exactly 40 cards (currently ${stats.totalCards}).`);
        }

        // Rule 2: Champion Limit
        if (stats.champions > 6) {
            issues.push(`Deck can have at most 6 Champions (currently ${stats.champions}).`);
        }

        // Rule 3: Max 3 Copies
        Object.entries(counts).forEach(([id, count]) => {
            if (count > 3) {
                const cardName = cards.find(c => c.id === id)?.name || id;
                issues.push(`Too many copies of "${cardName}" (max 3, found ${count}).`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues,
            stats
        };
    }
}
