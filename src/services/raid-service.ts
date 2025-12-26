import { SerializedGameState as GameState, PlayerId } from '@/game/engine/game.types';

export interface RaidBoss {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    spells: string[];
    vfx: 'VOID' | 'LIGHTNING' | 'SHADOW';
}

export interface RaidState {
    boss: RaidBoss;
    players: string[]; // UserIds
    globalProgress: number; // 0-100
}

/**
 * Raid Service (Phase 21)
 * Manages collaborative boss encounters and global health syncing.
 */
export class RaidService {
    private static activeRaid: RaidState | null = {
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

    public static async getActiveRaid(): Promise<RaidState | null> {
        return this.activeRaid;
    }

    public static async submitDamage(damage: number): Promise<void> {
        if (this.activeRaid) {
            this.activeRaid.boss.health = Math.max(0, this.activeRaid.boss.health - damage);
            this.activeRaid.globalProgress = Math.min(100, this.activeRaid.globalProgress + (damage / 50));
        }
    }
}
