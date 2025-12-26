import { Card } from '@/lib/database.types';

export interface TradeOffer {
    id: string;
    ownerName: string;
    offeringCard: Card;
    seekingCardId: string; // The specific card ID they want
    createdAt: number;
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
}

export class TradeService {
    private static trades: TradeOffer[] = [];

    public static createOffer(owner: string, card: Card, seekingId: string): TradeOffer {
        const offer: TradeOffer = {
            id: Math.random().toString(36).substr(2, 9),
            ownerName: owner,
            offeringCard: card,
            seekingCardId: seekingId,
            createdAt: Date.now(),
            status: 'ACTIVE'
        };
        this.trades.unshift(offer);
        return offer;
    }

    public static getActiveTrades(): TradeOffer[] {
        return this.trades.filter(t => t.status === 'ACTIVE');
    }

    public static fulfillTrade(tradeId: string): boolean {
        const trade = this.trades.find(t => t.id === tradeId);
        if (trade) {
            trade.status = 'COMPLETED';
            return true;
        }
        return false;
    }
}
