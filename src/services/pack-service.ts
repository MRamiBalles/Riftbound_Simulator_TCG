import { Card, Rarity } from '@/lib/database.types';
import { MOCK_CARDS } from './card-service';

// Drop Rates (Cumulative)
// Common: 0-60
// Rare: 60-90
// Epic: 90-98
// Legendary: 98-99.8
// God Roll: 99.8-100
const DROP_RATES = {
    COMMON: 60,
    RARE: 90,
    EPIC: 98,
    LEGENDARY: 99.8
};

export interface PackResult {
    cards: Card[];
    godRoll: boolean;
}

export const openPack = async (): Promise<PackResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const pack: Card[] = [];
    let godRoll = false;

    // Standard Pack: 5 Cards
    for (let i = 0; i < 5; i++) {
        const roll = Math.random() * 100;
        let rarity: Rarity = 'Common';

        if (roll > 99.8) {
            rarity = 'Champion'; // God Roll maps to Champion for now, but implies special art
            godRoll = true;
        } else if (roll > 98) {
            rarity = 'Champion';
        } else if (roll > 90) {
            rarity = 'Epic';
        } else if (roll > 60) {
            rarity = 'Rare';
        }

        // Find cards of this rarity
        const pool = MOCK_CARDS.filter(c => c.rarity === rarity);

        // Fallback if pool empty (shouldn't happen with full DB)
        const fallbackPool = MOCK_CARDS;

        const selectedPool = pool.length > 0 ? pool : fallbackPool;
        const card = selectedPool[Math.floor(Math.random() * selectedPool.length)];

        // Clone to ensure unique instance if we track newness
        pack.push({ ...card });
    }

    return { cards: pack, godRoll };
};
