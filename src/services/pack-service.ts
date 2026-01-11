import { Card, MOCK_CARDS } from './card-service';

export type PackType = 'alpha' | 'omega' | 'void' | 'master_box';

export class PackService {
    public static async openPack(type: PackType): Promise<Card[]> {
        // Simple simulation: Return 5 random cards
        const pack: Card[] = [];
        const packSize = type === 'master_box' ? 12 : 5;

        for (let i = 0; i < packSize; i++) {
            const card = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
            pack.push(card);
        }

        // Ensure at least one rare-ish card for the feel
        if (pack.length > 0 && !pack.some(c => c.rarity === 'Legendary' || c.rarity === 'Epic')) {
            const highRarity = MOCK_CARDS.filter(c => c.rarity === 'Legendary' || c.rarity === 'Epic');
            if (highRarity.length > 0) {
                pack[0] = highRarity[Math.floor(Math.random() * highRarity.length)];
            }
        }

        return pack;
    }

    public static getPackPrice(type: PackType): number {
        switch (type) {
            case 'alpha': return 100;
            case 'omega': return 250;
            case 'void': return 500;
            case 'master_box': return 1200;
            default: return 100;
        }
    }
}
