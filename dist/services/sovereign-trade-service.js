"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeEngine = exports.SovereignTradeService = void 0;
class SovereignTradeService {
    static instance;
    marketIndex = new Map();
    saturationLevel = 0; // 0.0 (Empty) to 1.0 (Full Saturation)
    constructor() {
        // [SIMULATION] Initialize with dummy meta data
        this.initializeMockMarket();
        // [LIQUIDITY RECOVERY]
        // Market appetite recovers 5% every 10 seconds
        setInterval(() => this.recoverLiquidity(), 10000);
    }
    recoverLiquidity() {
        if (this.saturationLevel > 0) {
            this.saturationLevel = Math.max(0, this.saturationLevel - 0.05);
            // console.log(`[SovereignTrade] 💧 Liquidity Recovering. Saturation: ${(this.saturationLevel*100).toFixed(0)}%`);
        }
    }
    static getInstance() {
        if (!SovereignTradeService.instance) {
            SovereignTradeService.instance = new SovereignTradeService();
        }
        return SovereignTradeService.instance;
    }
    initializeMockMarket() {
        console.log('[SovereignTrade] Initializing Market Ledger...');
    }
    /**
     * THE ORACLE FORMULA: P(c) ∝ α⋅WR(c) + β⋅S
     */
    evaluateAsset(card) {
        let metric = this.marketIndex.get(card.id);
        if (!metric) {
            // Calculate Fundamental Value
            const baseWR = 0.45 + (Math.random() * 0.1); // Random WR between 45% and 55%
            const rarityMult = this.getRarityMultiplier(card.rarity);
            // Safe property access with fallback
            const desc = card.description || card.abilities?.join(' ') || '';
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
    /**
     * [LIQUIDITY FATIGUE PROTOCOL]
     * Calculates offer based on Market Saturation.
     * High Volume -> High Saturation -> Lower Offers (Preventing Infinite Loops).
     */
    getQuickSellOffer(card) {
        const metric = this.evaluateAsset(card);
        // Base Spread (10-20% based on Volatility)
        const baseSpread = metric.volatility > 0.5 ? 0.20 : 0.10;
        // Fatigue Malus (Up to 50% extra fee if fully saturated)
        const fatigueMalus = this.saturationLevel * 0.50;
        // Total Fee
        const totalFee = baseSpread + fatigueMalus;
        const offerRatio = Math.max(0.30, 1 - totalFee); // Floor at 30% value
        return Math.floor(metric.currentPrice * offerRatio);
    }
    confirmQuickSell(cardId) {
        // Consuming liquidity increases saturation
        // Higher rarity = More saturation (harder to offload)
        const metric = this.marketIndex.get(cardId);
        const impact = metric ? (metric.scarcityMultiplier * 0.01) : 0.05;
        this.saturationLevel = Math.min(1.0, this.saturationLevel + impact);
        console.log(`[SovereignTrade] 💸 Asset Sold. Market Saturation: ${(this.saturationLevel * 100).toFixed(1)}%`);
    }
    getMarketSaturation() {
        return this.saturationLevel;
    }
    /**
     * [MARKET PANIC PROTOCOL]
     * Simulates a "Flash Crash" caused by a sudden shift in the Meta (e.g. Counter discovered).
     * @param cardId The asset being dumped.
     * @param severity The percentage of value loss (0.1 to 0.5).
     */
    triggerMarketCorrection(cardId, severity) {
        const metric = this.marketIndex.get(cardId);
        if (!metric)
            return;
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
    attemptStabilization(cardId) {
        const metric = this.marketIndex.get(cardId);
        if (!metric)
            return;
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
    getRarityMultiplier(rarity) {
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
exports.SovereignTradeService = SovereignTradeService;
exports.tradeEngine = SovereignTradeService.getInstance();
