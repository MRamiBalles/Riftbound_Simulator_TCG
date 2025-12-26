import { Card } from '@/lib/database.types';

export interface CardLegacyStats {
    wins: number;
    games: number;
    kills: number;
}

/**
 * Legacy Service (Phase 24)
 * Manages card-specific titles and visual evolution based on performance.
 */
export class LegacyService {
    public static getTitle(stats: { wins: number; games: number; kills: number }): string | null {
        if (stats.kills >= 50) return 'The Executioner';
        if (stats.wins >= 25) return 'The Unconquered';
        if (stats.games >= 100) return 'The Veteran';
        if (stats.kills >= 10 && stats.wins >= 5) return 'The Rising Star';
        return null;
    }

    public static getVfxType(stats: CardLegacyStats): 'GOLDEN_TRAIL' | 'VOID_PULSE' | 'NONE' {
        if (stats.wins >= 50) return 'GOLDEN_TRAIL';
        if (stats.kills >= 30) return 'VOID_PULSE';
        return 'NONE';
    }

    public static formatStats(stats: CardLegacyStats): string {
        return `${stats.wins}W / ${stats.kills}K / ${stats.games}G`;
    }
}
