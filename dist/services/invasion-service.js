"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvasionService = void 0;
class InvasionService {
    static currentBoss = {
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
    static personalDamage = 12450;
    static stolenCards = [];
    static getBoss() {
        return this.currentBoss;
    }
    static recordDamage(amount) {
        // AI Logic: Card Theft (Dimensional Rift)
        let theft;
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
    static getPersonalContribution() {
        return this.personalDamage;
    }
    static getStolenCount() {
        return this.stolenCards.length;
    }
    static getSeasonRankings() {
        return [
            { name: 'VoidWalker', points: 850000, rank: 1, title: 'Herald of the End' },
            { name: 'MasterPlayer', points: this.personalDamage * 10, rank: 2, title: 'Rift Guardian' },
            { name: 'Nova_Stellar', points: 420000, rank: 3, title: 'Star-Child' }
        ];
    }
}
exports.InvasionService = InvasionService;
