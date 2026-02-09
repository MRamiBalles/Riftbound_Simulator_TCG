"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaidService = void 0;
/**
 * Raid Service (Phase 21)
 * Manages collaborative boss encounters and global health syncing.
 */
class RaidService {
    static activeRaid = {
        boss: {
            id: 'boss-001',
            name: 'BARON NASHOR: RIFTBREAKER',
            health: 500,
            maxHealth: 500,
            spells: ['Void Acid', 'Spine Spray', 'Rift Quake'],
            vfx: 'VOID'
        },
        players: ['Player_442', 'RiftWalker_99', 'ShadowBlade'],
        globalProgress: 12
    };
    static async getActiveRaid() {
        return this.activeRaid;
    }
    static async submitDamage(damage) {
        if (this.activeRaid) {
            this.activeRaid.boss.health = Math.max(0, this.activeRaid.boss.health - damage);
            this.activeRaid.globalProgress = Math.min(100, this.activeRaid.globalProgress + (damage / 50));
        }
    }
}
exports.RaidService = RaidService;
