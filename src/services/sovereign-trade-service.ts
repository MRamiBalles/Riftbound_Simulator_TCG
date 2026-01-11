import { Card } from '@/lib/database.types';

// [Sovereign Economy]
// The Valuation Oracle determines asset price based on Meta Performance (Win Rate)
// and Scarcity, rather than static values.

export interface MarketMetric {
    cardId: string;
    winRate: number; // 0.0 to 1.0 (Derived from LeagueManager)
    pickRate: number; // 0.0 to 1.0
    scarcityMultiplier: number; // 1.0 (Common) to 50.0 (Champion)
    currentPrice: number; // In Scraps/Gold
    trend: 'UP' | 'DOWN' | 'STABLE';
    volatility: number;
}

export class SovereignTradeService {
    private static instance: SovereignTradeService;
    private marketIndex: Map<string, MarketMetric> = new Map();

    private constructor() {
        // [SIMULATION] Initialize with dummy meta data
        // In a real scenario, this would sync with LeagueManager
        this.initializeMockMarket();
    }

    public static getInstance(): SovereignTradeService {
        if (!SovereignTradeService.instance) {
            SovereignTradeService.instance = new SovereignTradeService();
        }
        return SovereignTradeService.instance;
    }

    private initializeMockMarket() {
        // Simulate a "Meta Snapshot"
        console.log('[SovereignTrade] Initializing Market Ledger...');
    }

    /**
     * THE ORACLE FORMULA: P(c) ∝ α⋅WR(c) + β⋅S
     */
    public evaluateAsset(card: Card): MarketMetric {
        let metric = this.marketIndex.get(card.id);

        // If not in index, generate a "Discovery Value"
        if (!metric) {
            const baseWR = 0.45 + (Math.random() * 0.1); // Random WR between 45% and 55%
            const rarityMult = this.getRarityMultiplier(card.rarity);

            // Meta Spike for specific keywords (Simulating AI exploiting a mechanic)
            const desc = (card as any).description || (card as any).abilities?.join(' ') || '';
            const isMeta = desc.includes('Elusive') || desc.includes('Overwhelm');
            const wr = isMeta ? baseWR + 0.15 : baseWR;

            const price = Math.floor((wr * 1000 * rarityMult) + (Math.random() * 50));

            metric = {
                cardId: card.id,
                winRate: wr,
                pickRate: wr * 0.8,
                scarcityMultiplier: rarityMult,
                currentPrice: price,
                trend: wr > 0.55 ? 'UP' : 'STABLE',
                volatility: isMeta ? 0.8 : 0.2
            };
            this.marketIndex.set(card.id, metric);
        }

        return metric;
    }

    public getQuickSellOffer(card: Card): number {
        const metric = this.evaluateAsset(card);
        // "Market Maker" Bot Offer: 90% of value (Liquidity Fee)
        return Math.floor(metric.currentPrice * 0.90);
    }

    private getRarityMultiplier(rarity: string): number {
        switch (rarity) {
            case 'Common': return 1;
            case 'Rare': return 5;
            case 'Epic': return 20;
            case 'Legendary': return 100;
            case 'Champion': return 500;
            default: return 1;
        }
    }
}

export const tradeEngine = SovereignTradeService.getInstance();
