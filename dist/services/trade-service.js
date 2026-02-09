"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeService = void 0;
class TradeService {
    static trades = [];
    static createOffer(owner, card, seekingId) {
        const offer = {
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
    static getActiveTrades() {
        return this.trades.filter(t => t.status === 'ACTIVE');
    }
    static fulfillTrade(tradeId) {
        const trade = this.trades.find(t => t.id === tradeId);
        if (trade) {
            trade.status = 'COMPLETED';
            return true;
        }
        return false;
    }
}
exports.TradeService = TradeService;
