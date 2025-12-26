import { Action, PlayerId } from '../game/engine/game.types';
import { Card } from '@/lib/database.types';

export interface ReplayData {
    id: string;
    version: string;
    date: string;
    seed: number;
    playerDeck: string[]; // Card IDs
    opponentDeck: string[]; // Card IDs
    actions: Action[];
    winner: PlayerId | null;
}

export class ReplayService {
    private static STORAGE_KEY = 'riftbound_replays';

    /**
     * Serializes a game session into a ReplayData object.
     */
    public static createReplay(
        seed: number,
        playerDeck: Card[],
        opponentDeck: Card[],
        history: Action[],
        winner: PlayerId | null
    ): ReplayData {
        return {
            id: crypto.randomUUID(),
            version: '1.0.0',
            date: new Date().toISOString(),
            seed,
            playerDeck: playerDeck.map(c => c.id),
            opponentDeck: opponentDeck.map(c => c.id),
            actions: history,
            winner
        };
    }

    /**
     * Saves a replay to LocalStorage.
     */
    public static saveToLibrary(replay: ReplayData) {
        const existing = this.getLibrary();
        existing.unshift(replay);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing.slice(0, 50))); // Keep last 50
    }

    /**
     * Retrieves the replay library.
     */
    public static getLibrary(): ReplayData[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Exports a replay as a Base64 string for sharing.
     */
    public static exportReplay(replay: ReplayData): string {
        return btoa(JSON.stringify(replay));
    }

    /**
     * Imports a replay from a Base64 string.
     */
    public static importReplay(data: string): ReplayData {
        return JSON.parse(atob(data));
    }
}
