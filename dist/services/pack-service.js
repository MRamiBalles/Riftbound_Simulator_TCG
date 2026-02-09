"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackService = void 0;
const card_service_1 = require("./card-service");
class PackService {
    static async openPack(type) {
        // Simple simulation: Return 5 random cards
        const pack = [];
        const packSize = type === 'master_box' ? 12 : 5;
        for (let i = 0; i < packSize; i++) {
            const card = card_service_1.MOCK_CARDS[Math.floor(Math.random() * card_service_1.MOCK_CARDS.length)];
            pack.push(card);
        }
        // Ensure at least one rare-ish card for the feel
        if (pack.length > 0 && !pack.some(c => c.rarity === 'Legendary' || c.rarity === 'Epic')) {
            const highRarity = card_service_1.MOCK_CARDS.filter(c => c.rarity === 'Legendary' || c.rarity === 'Epic');
            if (highRarity.length > 0) {
                pack[0] = highRarity[Math.floor(Math.random() * highRarity.length)];
            }
        }
        return pack;
    }
    static getPackPrice(type) {
        switch (type) {
            case 'alpha': return 100;
            case 'omega': return 250;
            case 'void': return 500;
            case 'master_box': return 1200;
            default: return 100;
        }
    }
}
exports.PackService = PackService;
