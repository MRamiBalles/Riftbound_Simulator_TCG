'use client';

import { MOCK_CARDS, Card } from '@/services/card-service';

export interface DraftPick {
    options: Card[];
    selected: Card | null;
}

/**
 * Expedition Engine
 * Manages the Draft mode logic where players build decks from random pools.
 */
export class DraftService {
    private static currentDraft: DraftPick[] = [];
    private static readonly DRAFT_SIZE = 40;

    /**
     * Generates a new pool of 3 cards for a pick.
     */
    public static generatePick(): Card[] {
        const pool: Card[] = [];
        const available = [...MOCK_CARDS];

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
    public static isComplete(picks: Card[]): boolean {
        return picks.length >= this.DRAFT_SIZE;
    }

    /**
     * Simulates the AI drafting (for testing or bot games).
     */
    public static aiSelect(options: Card[]): Card {
        // High-value heuristic: pick the one with highest stats for now
        return options.reduce((best, current) =>
            (current.attack + current.health) > (best.attack + best.health) ? current : best
        );
    }
}
