"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointStrategyService = void 0;
class PointStrategyService {
    static ORIGINS_STRATEGY = {
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
    static calculatePoints(count, isBox = false) {
        let points = count * this.ORIGINS_STRATEGY.basePointsPerPack;
        if (count >= 10) {
            points *= this.ORIGINS_STRATEGY.bulkMultiplier;
        }
        if (isBox) {
            points += this.ORIGINS_STRATEGY.boxBonus;
        }
        return Math.floor(points);
    }
    static getTier(totalPoints) {
        return [...this.ORIGINS_STRATEGY.loyaltyTiers].reverse().find(t => totalPoints >= t.threshold) || this.ORIGINS_STRATEGY.loyaltyTiers[0];
    }
}
exports.PointStrategyService = PointStrategyService;
