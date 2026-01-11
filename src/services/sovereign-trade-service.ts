import { Card } from '@/lib/database.types';

// [Sovereign Economy]
// The Valuation Oracle determines asset price based on Meta Performance (Win Rate)
// and Scarcity, rather than static values.

export interface MarketMetric {
    cardId: string;
    fundamentalValue: number; // The "True" value based on WinRate (Oracle)
    currentPrice: number; // The "Trading" value (affected by Panic/Hype)
    winRate: number; // 0.0 to 1.0 (Derived from LeagueManager)
    pickRate: number; // 0.0 to 1.0
    scarcityMultiplier: number; // 1.0 (Common) to 50.0 (Champion)
    trend: 'UP' | 'DOWN' | 'STABLE' | 'RECOVERING';
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

        if (!metric) {
            // Calculate Fundamental Value
            const baseWR = 0.45 + (Math.random() * 0.1); // Random WR between 45% and 55%
            const rarityMult = this.getRarityMultiplier(card.rarity);

            // Safe property access with fallback
            const desc = (card as any).description || (card as any).abilities?.join(' ') || '';
            const isMeta = desc.includes('Elusive') || desc.includes('Overwhelm');
            const wr = isMeta ? baseWR + 0.15 : baseWR;

            // Fundamental Value = (WinRate * 1000 * Rarity)
            const fundamental = Math.floor(wr * 1000 * rarityMult);

            // Initial Market Price matches Fundamental + noise
            const price = Math.floor(fundamental + (Math.random() * 50));

            metric = {
                cardId: card.id,
                fundamentalValue: fundamental,
                currentPrice: price,
                winRate: wr,
                pickRate: wr * 0.8,
                scarcityMultiplier: rarityMult,
                trend: wr > 0.55 ? 'UP' : 'STABLE',
                volatility: isMeta ? 0.8 : 0.2
            };
            this.marketIndex.set(card.id, metric);
        }

        return metric;
    }

    public getQuickSellOffer(card: Card): number {
        const metric = this.evaluateAsset(card);
        // During PANIC (High Volatility), offer spreads widen (80% value)
        // During STABLE/RECOVERY, offers tighten (90% value)
        const spread = metric.volatility > 0.5 ? 0.80 : 0.90;
        return Math.floor(metric.currentPrice * spread);
    }

    /**
     * [MARKET PANIC PROTOCOL]
     * Simulates a "Flash Crash" caused by a sudden shift in the Meta (e.g. Counter discovered).
     * @param cardId The asset being dumped.
     * @param severity The percentage of value loss (0.1 to 0.5).
     */
    public triggerMarketCorrection(cardId: string, severity: number) {
        const metric = this.marketIndex.get(cardId);
        if (!metric) return;

        console.log(`[SovereignTrade] 📉 FLASH CRASH DETECTED for ${cardId}. Severity: ${severity * 100}%`);

        // 1. Immediate Price Correction (Panic Selling)
        const oldPrice = metric.currentPrice;
        const panicPrice = Math.floor(oldPrice * (1 - severity));

        // 2. Adjust Metrics: Price disconnects from Fundamental Value
        metric.currentPrice = panicPrice;
        metric.trend = 'DOWN';
        metric.volatility = 0.9; // Extreme volatility

        // Slight hit to fundamental (maybe the counter is real?)
        metric.fundamentalValue = Math.floor(metric.fundamentalValue * 0.95);

        // 3. Emit Event for UI (Newsfeed/Ticker)
        window.dispatchEvent(new CustomEvent('SOVEREIGN_MARKET_EVENT', {
            detail: {
                type: 'CRASH',
                cardId,
                message: `PANIC SELL: Asset value plummeting due to meta shift!`,
                delta: panicPrice - oldPrice
            }
        }));

        this.marketIndex.set(cardId, metric);

        // [STABILIZATION PROTOCOL]
        // Trigger Dip Buyers after a delay (3 seconds)
        // This simulates Algo-Traders spotting the inefficiency
        setTimeout(() => this.attemptStabilization(cardId), 3000);

        return metric;
    }

    /**
     * [MEAN REVERSION LOGIC]
     * "Dip Buyers" enter if Price << Fundamental Value.
     * Checks if the discount is "Irrational" (> 40%).
     */
    public attemptStabilization(cardId: string) {
        const metric = this.marketIndex.get(cardId);
        if (!metric) return;

        // Ratio of Price to Real Value
        const undervaluation = metric.currentPrice / metric.fundamentalValue; // e.g. 0.55

        // If Discount > 40% (Price < 0.6 * Fundamental), Bots Buy.
        if (undervaluation < 0.60) {
            console.log(`[SovereignTrade] 🐂 DIP BUYERS DETECTED. Asset Undervalued (${undervaluation.toFixed(2)}x). Stabilizing...`);

            const oldPrice = metric.currentPrice;
            const recoveryPrice = Math.floor(metric.currentPrice * 1.25); // +25% Bounce

            metric.currentPrice = recoveryPrice;
            metric.trend = 'RECOVERING';
            metric.volatility = 0.4; // Volatility cools down

            window.dispatchEvent(new CustomEvent('SOVEREIGN_MARKET_EVENT', {
                detail: {
                    type: 'RECOVERY',
                    cardId,
                    message: `MARKET RECOVERY: Dip buyers creating support wall.`,
                    delta: recoveryPrice - oldPrice
                }
            }));

            this.marketIndex.set(cardId, metric);
        }
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
