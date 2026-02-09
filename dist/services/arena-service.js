"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenaService = void 0;
class ArenaService {
    static currentRun = null;
    static startRun() {
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
    static getDraftOptions(pool) {
        // Logic: Return 3 cards from pool with variant rarity weights
        const options = [];
        for (let i = 0; i < 3; i++) {
            options.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return options;
    }
    static recordResult(isWin) {
        if (!this.currentRun)
            return null;
        if (isWin)
            this.currentRun.wins++;
        else
            this.currentRun.losses++;
        if (this.currentRun.wins >= 3 || this.currentRun.losses >= 2) {
            this.currentRun.status = 'FINISHED';
        }
        return this.currentRun;
    }
    static getRun() { return this.currentRun; }
}
exports.ArenaService = ArenaService;
