import { Card } from '@/lib/database.types';

export interface ArenaRun {
    id: string;
    deck: string[];
    wins: number;
    losses: number;
    currentDraftIndex: number;
    status: 'DRAFTING' | 'PLAYING' | 'FINISHED';
}

export class ArenaService {
    private static currentRun: ArenaRun | null = null;

    public static startRun(): ArenaRun {
        this.currentRun = {
            id: Math.random().toString(36).substr(2, 9),
            deck: [],
            wins: 0,
            losses: 0,
            currentDraftIndex: 0,
            status: 'DRAFTING'
        };
        return this.currentRun;
    }

    public static getDraftOptions(pool: Card[]): Card[] {
        // Logic: Return 3 cards from pool with variant rarity weights
        const options: Card[] = [];
        for (let i = 0; i < 3; i++) {
            options.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return options;
    }

    public static recordResult(isWin: boolean): ArenaRun | null {
        if (!this.currentRun) return null;

        if (isWin) this.currentRun.wins++;
        else this.currentRun.losses++;

        if (this.currentRun.wins >= 3 || this.currentRun.losses >= 2) {
            this.currentRun.status = 'FINISHED';
        }

        return this.currentRun;
    }

    public static getRun() { return this.currentRun; }
}
