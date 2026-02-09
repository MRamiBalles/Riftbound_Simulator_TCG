"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftService = void 0;
const card_service_1 = require("@/services/card-service");
/**
 * Expedition Engine
 * Manages the Draft mode logic where players build decks from random pools.
 */
class DraftService {
    static currentDraft = [];
    static DRAFT_SIZE = 40;
    /**
     * Generates a new pool of 3 cards for a pick.
     */
    static generatePick() {
        const pool = [];
        const available = [...card_service_1.MOCK_CARDS];
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * available.length);
            pool.push(available[idx]);
            available.splice(idx, 1);
        }
        return pool;
    }
    /**
     * Validates if a draft is complete.
     */
    static isComplete(picks) {
        return picks.length >= this.DRAFT_SIZE;
    }
    /**
     * Simulates the AI drafting (for testing or bot games).
     */
    static aiSelect(options) {
        // High-value heuristic: pick the one with highest stats for now
        return options.reduce((best, current) => (current.attack + current.health) > (best.attack + best.health) ? current : best);
    }
}
exports.DraftService = DraftService;
