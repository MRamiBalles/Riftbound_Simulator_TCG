import { describe, it, expect } from 'vitest';
import { EffectResolver } from '../EffectResolver';
import { CardEffect, EffectContext } from '../effect.types';
import { RuntimeCard } from '../../RuntimeCard';
import { SerializedGameState } from '../../game.types';

// =============================================================================
// TEST HELPERS
// =============================================================================

const createMockState = (): SerializedGameState => ({
    turn: 1,
    phase: 'Main',
    activePlayer: 'player',
    priority: 'player',
    players: {
        player: {
            health: 20,
            maxHealth: 20,
            mana: 5,
            maxMana: 5,
            spellMana: 0,
            field: [],
            hand: [],
            deck: [],
            graveyard: []
        },
        opponent: {
            health: 20,
            maxHealth: 20,
            mana: 5,
            maxMana: 5,
            spellMana: 0,
            field: [],
            hand: [],
            deck: [],
            graveyard: []
        }
    },
    stack: [],
    combat: null,
    log: [],
    winner: null,
    seed: 12345,
    actionHistory: []
});

const createMockUnit = (
    id: string,
    ownerId: 'player' | 'opponent',
    overrides: Partial<RuntimeCard> = {}
): RuntimeCard => ({
    id,
    instanceId: id,
    ownerId,
    name: `Unit ${id}`,
    type: 'Unit',
    rarity: 'Common',
    cost: 1,
    currentCost: 1,
    attack: 2,
    health: 3,
    currentAttack: 2,
    currentHealth: 3,
    maxHealth: 3,
    keywords: [],
    image_url: '',
    flavor_text: '',
    region: 'Test',
    subtypes: [],
    text: '',
    set_id: 'test',
    collector_number: 1,
    artist: '',
    hasAttacked: false,
    summoningSickness: false,
    isStunned: false,
    isBarrierActive: false,
    enchantments: [],
    ...overrides
} as RuntimeCard);

const createContext = (overrides: Partial<EffectContext> = {}): EffectContext => ({
    seed: 12345,
    sourceId: 'source-card',
    ownerId: 'player',
    turn: 1,
    ...overrides
});

// =============================================================================
// TESTS
// =============================================================================

describe('EffectResolver', () => {
    describe('DAMAGE Action', () => {
        it('should deal damage to opponent nexus', () => {
            const state = createMockState();
            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'ENEMY_NEXUS',
                    value: 5
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.health).toBe(15);
            expect(result.damageEvents).toHaveLength(1);
            expect(result.damageEvents[0].amount).toBe(5);
        });

        it('should deal damage to ALL_ENEMIES', () => {
            const state = createMockState();
            const enemy1 = createMockUnit('enemy1', 'opponent', { currentHealth: 5, maxHealth: 5 });
            const enemy2 = createMockUnit('enemy2', 'opponent', { currentHealth: 3, maxHealth: 3 });
            state.players.opponent.field = [enemy1, enemy2];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_ATTACK',
                    action: 'DAMAGE',
                    target: 'ALL_ENEMIES',
                    value: 2
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_ATTACK', context);

            expect(newState.players.opponent.field[0].currentHealth).toBe(3); // 5 - 2
            expect(newState.players.opponent.field[1].currentHealth).toBe(1); // 3 - 2
            expect(result.damageEvents).toHaveLength(2);
        });

        it('should apply Tough damage reduction', () => {
            const state = createMockState();
            const toughEnemy = createMockUnit('enemy', 'opponent', {
                currentHealth: 5,
                keywords: ['Tough'] as any
            });
            state.players.opponent.field = [toughEnemy];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'ALL_ENEMIES',
                    value: 3
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.field[0].currentHealth).toBe(3); // 5 - (3-1)
            expect(result.damageEvents[0].amount).toBe(2);
        });

        it('should pop Barrier instead of dealing damage', () => {
            const state = createMockState();
            const barrierEnemy = createMockUnit('enemy', 'opponent', {
                currentHealth: 3,
                isBarrierActive: true
            });
            state.players.opponent.field = [barrierEnemy];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'ALL_ENEMIES',
                    value: 5
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.field[0].currentHealth).toBe(3); // No damage
            expect(newState.players.opponent.field[0].isBarrierActive).toBe(false); // Barrier popped
            expect(result.log.some(l => l.includes('Barrier'))).toBe(true);
        });
    });

    describe('HEAL Action', () => {
        it('should heal owner nexus', () => {
            const state = createMockState();
            state.players.player.health = 10;

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'HEAL',
                    target: 'OWNER',
                    value: 5
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.player.health).toBe(15);
            expect(result.healEvents).toHaveLength(1);
        });

        it('should not overheal past maxHealth', () => {
            const state = createMockState();
            state.players.player.health = 18;

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'HEAL',
                    target: 'OWNER',
                    value: 10
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.player.health).toBe(20); // Capped at max
            expect(result.healEvents[0].amount).toBe(2); // Only healed 2
        });
    });

    describe('DRAW Action', () => {
        it('should draw cards from deck to hand', () => {
            const state = createMockState();
            const deckCards = [
                createMockUnit('card1', 'player'),
                createMockUnit('card2', 'player'),
                createMockUnit('card3', 'player')
            ];
            state.players.player.deck = deckCards;

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DRAW',
                    target: 'OWNER',
                    value: 2
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.player.hand).toHaveLength(2);
            expect(newState.players.player.deck).toHaveLength(1);
            expect(result.drawnCards).toHaveLength(2);
        });
    });

    describe('BUFF Actions', () => {
        it('should buff attack on SELF', () => {
            const state = createMockState();
            const unit = createMockUnit('source', 'player', { currentAttack: 2 });
            state.players.player.field = [unit];

            (unit as any).effects = [{
                trigger: 'ON_PLAY',
                action: 'BUFF_ATTACK',
                target: 'SELF',
                value: 3
            }];

            const context = createContext({ sourceId: 'source' });
            const { state: newState } = EffectResolver.resolve(state, unit, 'ON_PLAY', context);

            expect(newState.players.player.field[0].currentAttack).toBe(5); // 2 + 3
        });

        it('should buff ALL_ALLIES', () => {
            const state = createMockState();
            const ally1 = createMockUnit('ally1', 'player', { currentAttack: 1 });
            const ally2 = createMockUnit('ally2', 'player', { currentAttack: 2 });
            state.players.player.field = [ally1, ally2];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'BUFF_ATTACK',
                    target: 'ALL_ALLIES',
                    value: 2
                }]
            } as any);

            const context = createContext();
            const { state: newState } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.player.field[0].currentAttack).toBe(3);
            expect(newState.players.player.field[1].currentAttack).toBe(4);
        });
    });

    describe('GRANT_KEYWORD Action', () => {
        it('should grant keyword to unit', () => {
            const state = createMockState();
            const unit = createMockUnit('target', 'player', { keywords: [] });
            state.players.player.field = [unit];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'GRANT_KEYWORD',
                    target: 'ALL_ALLIES',
                    keyword: 'Lifesteal'
                }]
            } as any);

            const context = createContext();
            const { state: newState } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.player.field[0].keywords).toContain('Lifesteal');
        });
    });

    describe('STUN Action', () => {
        it('should stun target unit', () => {
            const state = createMockState();
            const enemy = createMockUnit('enemy', 'opponent', { isStunned: false });
            state.players.opponent.field = [enemy];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'STUN',
                    target: 'ALL_ENEMIES'
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.field[0].isStunned).toBe(true);
            expect(result.log.some(l => l.includes('stunned'))).toBe(true);
        });
    });

    describe('Conditions', () => {
        it('should not trigger if conditions not met', () => {
            const state = createMockState();

            const card = createMockUnit('source', 'player', {
                currentHealth: 3,
                maxHealth: 3, // Full health
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'ENEMY_NEXUS',
                    value: 5,
                    conditions: [{ type: 'IF_DAMAGED' }] // Requires damage
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.health).toBe(20); // No damage dealt
            expect(result.log.some(l => l.includes('not met'))).toBe(true);
        });

        it('should trigger if conditions are met', () => {
            const state = createMockState();

            const card = createMockUnit('source', 'player', {
                currentHealth: 2,
                maxHealth: 3, // Damaged!
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'ENEMY_NEXUS',
                    value: 5,
                    conditions: [{ type: 'IF_DAMAGED' }]
                }]
            } as any);

            const context = createContext();
            const { state: newState } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.health).toBe(15);
        });
    });

    describe('Deterministic Random', () => {
        it('should produce same result with same seed', () => {
            const state1 = createMockState();
            const state2 = createMockState();

            const enemies = [
                createMockUnit('e1', 'opponent'),
                createMockUnit('e2', 'opponent'),
                createMockUnit('e3', 'opponent')
            ];
            state1.players.opponent.field = [...enemies.map(e => ({ ...e }))];
            state2.players.opponent.field = [...enemies.map(e => ({ ...e }))];

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'RANDOM_ENEMY',
                    value: 99
                }]
            } as any);

            const context1 = createContext({ seed: 42 });
            const context2 = createContext({ seed: 42 });

            const result1 = EffectResolver.resolve(state1, card, 'ON_PLAY', context1);
            const result2 = EffectResolver.resolve(state2, card, 'ON_PLAY', context2);

            expect(result1.result.damageEvents[0].targetId).toBe(result2.result.damageEvents[0].targetId);
            expect(result1.result.newSeed).toBe(result2.result.newSeed);
        });
    });

    describe('Chained Effects (then)', () => {
        it('should execute chained effects in order', () => {
            const state = createMockState();
            state.players.player.health = 10;

            const card = createMockUnit('source', 'player', {
                effects: [{
                    trigger: 'ON_PLAY',
                    action: 'DAMAGE',
                    target: 'ENEMY_NEXUS',
                    value: 3,
                    then: [{
                        trigger: 'ON_PLAY', // Ignored for chained
                        action: 'HEAL',
                        target: 'OWNER',
                        value: 2
                    }]
                }]
            } as any);

            const context = createContext();
            const { state: newState, result } = EffectResolver.resolve(state, card, 'ON_PLAY', context);

            expect(newState.players.opponent.health).toBe(17); // Damaged
            expect(newState.players.player.health).toBe(12);  // Healed
            expect(result.damageEvents).toHaveLength(1);
            expect(result.healEvents).toHaveLength(1);
        });
    });
});
