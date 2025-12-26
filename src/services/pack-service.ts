import { Card, Rarity } from '@/lib/database.types';

export class PackService {
    /**
     * Simulation of weighted pack opening (Phase 25)
     * Inspired by TCGP: 5 cards per pack.
     */
    public static openPack(pool: Card[], packType: 'alpha' | 'omega' | 'void'): Card[] {
        const pack: Card[] = [];

        // Slots 1-3: Commons (80%), Rare (20%)
        for (let i = 0; i < 3; i++) {
            pack.push(this.pullCard(pool, ['Common', 'Rare'], packType));
        }

        // Slot 4: Epic or better (Probability based on rarity)
        pack.push(this.pullCard(pool, ['Epic', 'Legendary'], packType));

        // Slot 5: The "HYPE" slot (Legendary or Champion focus)
        pack.push(this.pullCard(pool, ['Epic', 'Legendary', 'Champion'], packType));

        return pack;
    }

    private static pullCard(pool: Card[], rarities: Rarity[], packType: string): Card {
        const filtered = pool.filter(c => rarities.includes(c.rarity));

        // Boost featured regions based on pack type
        // alpha -> Demacia/Ionia | omega -> Noxus/Freljord | void -> Void/Shadow Isles
        const featuredRegions: Record<string, string[]> = {
            'alpha': ['Demacia', 'Ionia'],
            'omega': ['Noxus', 'Freljord'],
            'void': ['Void', 'Shadow Isles']
        };

        const targetRegions = featuredRegions[packType] || [];

        // Weighted selection: Featured cards are 3x more likely
        const weights = filtered.map(c => targetRegions.includes(c.region) ? 3 : 1);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < filtered.length; i++) {
            random -= weights[i];
            if (random <= 0) return filtered[i];
        }

        return filtered[0];
    }
}
