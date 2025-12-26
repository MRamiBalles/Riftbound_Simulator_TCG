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

    private static personalDamage = 12450;
    private static stolenCards: string[] = [];

    public static getBoss(): WorldBoss {
        return this.currentBoss;
    }

    public static recordDamage(amount: number): { damage: number; stolen?: string } {
        // AI Logic: Card Theft (Dimensional Rift)
        let theft: string | undefined;
        if (Math.random() < 0.2) { // 20% chance on assault
            theft = 'Dimensional Rift';
            this.stolenCards.push('Legendary Card');
        }

        // Apply penalty for stolen cards
        const penalty = 1 - (this.stolenCards.length * 0.15);
        const finalDamage = Math.floor(amount * Math.max(0.1, penalty));

        this.currentBoss.currentHp = Math.max(0, this.currentBoss.currentHp - finalDamage);
        this.personalDamage += finalDamage;

        return { damage: finalDamage, stolen: theft };
    }

    public static getPersonalContribution(): number {
        return this.personalDamage;
    }

    public static getStolenCount(): number {
        return this.stolenCards.length;
    }

    public static getSeasonRankings() {
        return [
            { name: 'VoidWalker', points: 850000, rank: 1, title: 'Herald of the End' },
            { name: 'MasterPlayer', points: this.personalDamage * 10, rank: 2, title: 'Rift Guardian' },
            { name: 'Nova_Stellar', points: 420000, rank: 3, title: 'Star-Child' }
        ];
    }
}
