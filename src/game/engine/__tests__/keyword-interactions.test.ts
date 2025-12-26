import { CombatResolver } from '../CombatResolver';
import { RuntimeCard } from '../RuntimeCard';

// Helper to create a card for testing
const createMockUnit = (id: string, attack: number, health: number, keywords: string[] = []): RuntimeCard => ({
    id,
    instanceId: id,
    ownerId: 'p1',
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
    artist: '',
    hasAttacked: false,
    summoningSickness: false,
    isStunned: false,
    isBarrierActive: keywords.includes('Barrier'),
    enchantments: []
});

describe('Combat Engine: Keyword Interactions', () => {
    test('Overwhelm vs Tough: Should correctly reduce excess damage', () => {
        const attacker = createMockUnit('Attacker', 10, 10, ['Overwhelm']);
        const blocker = createMockUnit('Blocker', 2, 5, ['Tough']);

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Calculation: 
        // 1. Attacker deals 10 damage.
        // 2. Blocker (Tough) takes 10 - 1 = 9 damage.
        // 3. Excess damage for Overwhelm: 10 - 5 = 5.
        // 4. Results: Blocker HP is 5 - 9 = -4. Nexus damage is 5.
        expect(result.blockerDamageTaken).toBe(9);
        expect(result.overwhelmDamage).toBe(5);
    });

    test('Lifesteal vs Barrier: Should not heal if damage is negated', () => {
        const attacker = createMockUnit('Attacker', 5, 5, ['Lifesteal']);
        const blocker = createMockUnit('Blocker', 2, 5, ['Barrier']);

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Barrier should negate all 5 damage.
        // Lifesteal should heal 0.
        expect(result.blockerDamageTaken).toBe(0);
        expect(result.lifestealHeal).toBe(0);
        expect(result.poppedBarriers).toContain(blocker.instanceId);
    });

    test('Quick Attack vs Low HP: Should kill blocker without taking damage', () => {
        const attacker = createMockUnit('Attacker', 5, 1, ['Quick Attack']);
        const blocker = createMockUnit('Blocker', 5, 2);

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Attacker kills blocker (5 damage > 2 HP).
        // Since attacker has Quick Attack, it takes 0 damage because blocker died first.
        expect(result.blockerDamageTaken).toBe(5);
        expect(result.attackerDamageTaken).toBe(0);
    });

    test('Lifesteal + Overwhelm: Should heal for both unit and excess nexus damage', () => {
        const attacker = createMockUnit('Attacker', 10, 10, ['Lifesteal', 'Overwhelm']);
        const blocker = createMockUnit('Blocker', 1, 3);

        const result = CombatResolver.resolveUnitCombat(attacker, blocker);

        // Hits blocker for 3, Nexus for 7.
        // Total healing: 10.
        expect(result.lifestealHeal).toBe(10);
        expect(result.overwhelmDamage).toBe(7);
    });
});
