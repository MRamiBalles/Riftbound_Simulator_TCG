"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
class MetaService {
    static decks = [
        {
            id: 'meta1',
            name: 'Demacian Steel',
            description: 'Midrange dominance using high-stat Elite units and tactical strikes.',
            tier: 'S',
            winRate: 58.2,
            playRate: 15.4,
            coreCards: ['lux_v2', 'garen_v1'],
            trend: 'STABLE',
            tags: ['Midrange', 'Elite', 'Aggro']
        },
        {
            id: 'meta2',
            name: 'Void Breach',
            description: 'Aggressive expansion strategy focusing on swarming the board.',
            tier: 'S',
            winRate: 56.5,
            playRate: 12.1,
            coreCards: ['malzahar_v1', 'voidling_swarm'],
            trend: 'UP',
            tags: ['Swarm', 'Aggro', 'Void']
        },
        {
            id: 'meta3',
            name: 'Ionian Grace',
            description: 'Control-oriented deck utilizing stuns and elusive threats.',
            tier: 'A',
            winRate: 52.4,
            playRate: 18.2,
            coreCards: ['yasuo_v1', 'karma_v1'],
            trend: 'DOWN',
            tags: ['Control', 'Combo', 'Elusive']
        }
    ];
    static getMetaDecks() {
        return this.decks.sort((a, b) => {
            const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
            return tierOrder[a.tier] - tierOrder[b.tier] || b.winRate - a.winRate;
        });
    }
    static calculateTier(winRate, powerScore) {
        if (winRate > 55 && powerScore > 80)
            return 'S';
        if (winRate > 50 && powerScore > 60)
            return 'A';
        if (winRate > 45)
            return 'B';
        return 'C';
    }
}
exports.MetaService = MetaService;
