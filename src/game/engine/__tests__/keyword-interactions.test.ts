import { CombatResolver } from '../CombatResolver';
import { RuntimeCard } from '../RuntimeCard';

// Helper to create a card for testing
const createMockUnit = (id: string, attack: number, health: number, keywords: string[] = []): RuntimeCard => ({
    id,
    instanceId: id,
    ownerId: 'player',
    name: id,
    type: 'Unit',
    rarity: 'Common',
    cost: 1,
    currentCost: 1,
    attack,
    health,
    currentAttack: attack,
    currentHealth: health,
    maxHealth: health,
    keywords: keywords as any,
    image_url: '',
    flavor_text: '',
    region: 'Demacia',
    subtypes: [],
    text: '',
    set_id: '1',
    collector_number: 1,
    artist: '',
    hasAttacked: false,
    summoningSickness: false,
    isStunned: false,
    isBarrierActive: keywords.includes('Barrier'),
    enchantments: []
});

declare var describe: any;
declare var test: any;
declare var expect: any;

describe('Combat Engine: Keyword Interactions', () => {
    test('Overwhelm vs Tough: Should correctly reduce excess damage', () => {
        const attacker = createMockUnit('Attacker', 10, 10, ['Overwhelm']);
        const blocker = createMockUnit('Blocker', 2, 5, ['Tough']);
        blocker.ownerId = 'opponent';

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Results: 
        // Blocker took 10 - 1 = 9 damage.
        // Overwhelm excess: 10 - 5 = 5 damage to Nexus.
        const unitDmg = result.damageEvents.find(e => e.targetId === blocker.instanceId)?.amount;
        expect(unitDmg).toBe(9);
        expect(result.nexusDamage.opponent).toBe(5);
    });

    test('Lifesteal vs Barrier: Should not heal if damage is negated', () => {
        const attacker = createMockUnit('Attacker', 5, 5, ['Lifesteal']);
        const blocker = createMockUnit('Blocker', 2, 5, ['Barrier']);
        blocker.ownerId = 'opponent';

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Barrier should negate all 5 damage. Lifesteal should heal 0.
        expect(result.lifestealHeal.player).toBe(0);
        expect(result.poppedBarriers).toContain(blocker.instanceId);
    });

    test('Quick Attack vs Low HP: Should kill blocker without taking damage', () => {
        const attacker = createMockUnit('Attacker', 5, 1, ['Quick Attack']);
        const blocker = createMockUnit('Blocker', 5, 2);
        blocker.ownerId = 'opponent';

        const result = CombatResolver.resolveUnitCombat(attacker, blocker, true); // isQuickAttack = true

        // Attacker kills blocker. Attacker takes 0 damage because blocker died first.
        const attackerDmgTaken = result.damageEvents.find(e => e.targetId === attacker.instanceId)?.amount || 0;
        expect(attackerDmgTaken).toBe(0);
        expect(result.deadUnits).toContain(blocker.instanceId);
    });

    test('Lifesteal + Overwhelm: Should heal for both unit and excess nexus damage', () => {
        const attacker = createMockUnit('Attacker', 10, 10, ['Lifesteal', 'Overwhelm']);
        const blocker = createMockUnit('Blocker', 1, 3);
        blocker.ownerId = 'opponent';

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Total healing: 10 (3 from unit, 7 from nexus).
        expect(result.lifestealHeal.player).toBe(10);
        expect(result.nexusDamage.opponent).toBe(7);
    });
});
