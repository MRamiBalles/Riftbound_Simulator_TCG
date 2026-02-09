"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyService = void 0;
/**
 * Legacy Service (Phase 24)
 * Manages card-specific titles and visual evolution based on performance.
 */
class LegacyService {
    static getTitle(stats) {
        if (stats.kills >= 50)
            return 'The Executioner';
        if (stats.wins >= 25)
            return 'The Unconquered';
        if (stats.games >= 100)
            return 'The Veteran';
        if (stats.kills >= 10 && stats.wins >= 5)
            return 'The Rising Star';
        return null;
    }
    static getVfxType(stats) {
        if (stats.wins >= 50)
            return 'GOLDEN_TRAIL';
        if (stats.kills >= 30)
            return 'VOID_PULSE';
        return 'NONE';
    }
    static formatStats(stats) {
        return `${stats.wins}W / ${stats.kills}K / ${stats.games}G`;
    }
}
exports.LegacyService = LegacyService;
