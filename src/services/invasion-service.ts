export interface WorldBoss {
    id: string;
    name: string;
    title: string;
    totalHp: number;
    currentHp: number;
    type: 'VOID' | 'CELESTIAL' | 'NEXUS';
    abilities: { name: string; effect: string }[];
    endsAt: number;
    image?: string;
}

export class InvasionService {
    private static currentBoss: WorldBoss = {
        id: 'monarch_1',
        name: 'The Void Monarch',
        title: 'Harbinger of Non-Existence',
        totalHp: 1000000,
        currentHp: 784230,
        type: 'VOID',
        abilities: [
            { name: 'Null field', effect: 'Reduces all damage taken by 20%.' },
            { name: 'Void Pulse', effect: 'Deals 5 damage to all units every 2 turns.' }
        ],
        endsAt: Date.now() + (48 * 3600000) // 48 hours from now
    };

    public static getBoss(): WorldBoss {
        return this.currentBoss;
    }

    public static recordDamage(amount: number): void {
        this.currentBoss.currentHp = Math.max(0, this.currentBoss.currentHp - amount);
    }

    public static getPersonalContribution(): number {
        // Mocking user contribution
        return 12450;
    }
}
