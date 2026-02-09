"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftService = void 0;
class CraftService {
    static rates = {
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
    static getDustValue(card) {
        return this.rates.dusting[card.rarity] || 0;
    }
    static getCraftCost(card) {
        return this.rates.crafting[card.rarity] || 5000;
    }
    static getEvolutionCost(tier) {
        return 1000 * Math.pow(2, tier);
    }
}
exports.CraftService = CraftService;
