export interface PointStrategy {
    basePointsPerPack: number;
    bulkMultiplier: number;
    boxBonus: number;
    loyaltyTiers: {
        threshold: number;
        multiplier: number;
        title: string;
    }[];
    marketplaceYield: number;
}

export class PointStrategyService {
    public static readonly ORIGINS_STRATEGY: PointStrategy = {
        basePointsPerPack: 10,
        bulkMultiplier: 1.2, // 10 packs = 120 points instead of 100
        boxBonus: 500, // Buying a full box gives extra points
        loyaltyTiers: [
            { threshold: 0, multiplier: 1.0, title: 'Novice Breach' },
            { threshold: 1000, multiplier: 1.1, title: 'Ascended Member' },
            { threshold: 5000, multiplier: 1.25, title: 'Rift Sovereign' },
            { threshold: 25000, multiplier: 1.5, title: 'Genesis Eternal' }
        ],
        marketplaceYield: 0.05 // 5% of sale price as Prestige
    };

    public static calculatePoints(count: number, isBox: boolean = false): number {
        let points = count * this.ORIGINS_STRATEGY.basePointsPerPack;

        if (count >= 10) {
            points *= this.ORIGINS_STRATEGY.bulkMultiplier;
        }

        if (isBox) {
            points += this.ORIGINS_STRATEGY.boxBonus;
        }

        return Math.floor(points);
    }

    public static getTier(totalPoints: number) {
        return [...this.ORIGINS_STRATEGY.loyaltyTiers].reverse().find(t => totalPoints >= t.threshold) || this.ORIGINS_STRATEGY.loyaltyTiers[0];
    }
}
