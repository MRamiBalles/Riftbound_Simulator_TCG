import { CombatResolver } from '../CombatResolver';
import { createRuntimeCard } from '../RuntimeCard';

describe('CombatResolver', () => {
    const mockUnit = (overrides = {}) => createRuntimeCard({
        id: 'test',
        name: 'Test Unit',
        cost: 1,
        type: 'Unit',
        rarity: 'Common',
        attack: 2,
        health: 2,
        image_url: '',
        set_id: 'test',
        collector_number: '1',
        subtypes: [],
        region: 'Noxus',
        text: '',
        ...overrides
    } as any, 'player');

    it('should resolve basic combat correctly', () => {
        const attacker = mockUnit({ attack: 3, health: 3 });
        const blocker = mockUnit({ attack: 2, health: 2 });
        attacker.ownerId = 'player';
        blocker.ownerId = 'opponent';

        const state: any = {
            activePlayer: 'player',
            players: {
                player: { field: [attacker] },
                opponent: { field: [blocker] }
            }
        };

        const result = CombatResolver.resolveCombat(state, {
            attackers: { [attacker.instanceId]: 'opponent' },
            blockers: { [blocker.instanceId]: attacker.instanceId },
            isCombatPhase: true,
            step: 'damage'
        });

        expect(result.deadUnits).toContain(blocker.instanceId);
        expect(result.damageEvents.length).toBe(2);
    });

    it('should respect Barrier and pop it', () => {
        const attacker = mockUnit({ attack: 5, health: 5 });
        const blocker = mockUnit({ attack: 1, health: 1 });
        blocker.isBarrierActive = true;

        const state: any = {
            activePlayer: 'player',
            players: {
                player: { field: [attacker] },
                opponent: { field: [blocker] }
            }
        };

        const result = CombatResolver.resolveCombat(state, {
            attackers: { [attacker.instanceId]: 'opponent' },
            blockers: { [blocker.instanceId]: attacker.instanceId },
            isCombatPhase: true,
            step: 'damage'
        });

        expect(result.deadUnits).not.toContain(blocker.instanceId);
        expect(result.damageEvents[0].amount).toBe(0);
    });

    it('should respect Quick Attack', () => {
        const attacker = mockUnit({ attack: 2, health: 1 });
        const blocker = mockUnit({ attack: 2, health: 2 });
        attacker.keywords = ['Quick Attack'];

        const state: any = {
            activePlayer: 'player',
            players: {
                player: { field: [attacker] },
                opponent: { field: [blocker] }
            }
        };

        const result = CombatResolver.resolveCombat(state, {
            attackers: { [attacker.instanceId]: 'opponent' },
            blockers: { [blocker.instanceId]: attacker.instanceId },
            isCombatPhase: true,
            step: 'damage'
        });

        expect(result.deadUnits).toContain(blocker.instanceId);
        expect(result.deadUnits).not.toContain(attacker.instanceId);
    });
});
