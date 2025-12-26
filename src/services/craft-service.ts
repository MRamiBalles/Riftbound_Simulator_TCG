import { Card } from '@/lib/database.types';

export class CraftService {
    public static rates = {
        dusting: {
            Common: 10,
            Rare: 50,
            Epic: 200,
            Legendary: 1000,
            Champion: 2500
        },
        crafting: {
            Common: 40,
            Rare: 250,
            Epic: 1000,
            Legendary: 5000,
            Champion: 15000
        }
    };

    public static getDustValue(card: Card): number {
        return this.rates.dusting[card.rarity as keyof typeof this.rates.dusting] || 0;
    }

    public static getCraftCost(card: Card): number {
        return this.rates.crafting[card.rarity as keyof typeof this.rates.crafting] || 5000;
    }

    public static getEvolutionCost(tier: number): number {
        return 1000 * Math.pow(2, tier);
    }
}
