import { describe, it, expect } from 'vitest';
import { CoreEngine } from '../CoreEngine';
import { Card } from '@/lib/database.types';
import { createRuntimeCard } from '../RuntimeCard';

describe('CoreEngine Integration & Coverage', () => {
    const mockCard = (id: string, overrides: Partial<Card> = {}): Card => ({
        id, name: `Card ${id}`, cost: 1, type: 'Unit', rarity: 'Common',
        attack: 1, health: 1, image_url: '', set_id: 'test', collector_number: id,
        subtypes: [], region: 'Test', text: '', keywords: [], ...overrides
    } as any);

    const pDeck = Array.from({ length: 40 }, (_, i) => mockCard(`p${i}`));
    const oDeck = Array.from({ length: 40 }, (_, i) => mockCard(`o${i}`));

    const startGame = (engine: CoreEngine) => {
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });
        // Boost Mana for testing
        (engine as any).state.players.player.mana = 10;
        (engine as any).state.players.opponent.mana = 10;
    };

    it('should execute full combat flow: Attack -> Block -> Damage -> Cleanup', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 111);
        startGame(engine);

        // Inject Units
        const attacker = createRuntimeCard(mockCard('att1', { attack: 5, health: 5, keywords: ['Overwhelm' as any] }), 'player', 'id-att-1');
        attacker.summoningSickness = false;

        const blocker = createRuntimeCard(mockCard('blk1', { attack: 1, health: 2 }), 'opponent', 'id-blk-1');
        blocker.summoningSickness = false;

        (engine as any).state.players.player.field.push(attacker);
        (engine as any).state.players.opponent.field.push(blocker);

        // 1. Declare Attackers
        engine.applyAction({ type: 'DECLARE_ATTACKERS', playerId: 'player', attackers: ['id-att-1'] });
        let state = engine.getState();
        expect(state.phase).toBe('Combat');
        expect(state.combat?.attackers['id-att-1']).toBe('opponent');
        expect(state.priority).toBe('opponent');

        // 2. Declare Blockers
        engine.applyAction({ type: 'DECLARE_BLOCKERS', playerId: 'opponent', blockers: { 'id-blk-1': 'id-att-1' } });

        // Should auto-resolve combat
        state = engine.getState();
        expect(state.phase).toBe('Main'); // Combat ended
        expect(state.combat).toBeNull();

        // Verify Damage
        // Blocker (2 HP) vs 5 Atk -> -3 HP (Dead)
        // Overwhelm: 5 - 2 = 3 to Nexus
        expect(state.players.opponent.field.length).toBe(0); // Blocker died
        expect(state.players.opponent.graveyard.length).toBe(1);
        expect(state.players.opponent.health).toBe(17); // 20 - 3

        // Log verification
        const log = state.log.join(',');
        expect(log).toContain('Dealt 3 damage to opponent');
    });

    it('should enforce Elusive blocking rules', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 222);
        startGame(engine);

        const elusiveAttacker = createRuntimeCard(mockCard('elu1', { keywords: ['Elusive' as any] }), 'player', 'id-elu-1');
        elusiveAttacker.summoningSickness = false;

        const normalBlocker = createRuntimeCard(mockCard('norm1'), 'opponent', 'id-norm-1');
        normalBlocker.summoningSickness = false;

        const elusiveBlocker = createRuntimeCard(mockCard('eluBlk', { keywords: ['Elusive' as any] }), 'opponent', 'id-elu-blk');
        elusiveBlocker.summoningSickness = false;

        (engine as any).state.players.player.field.push(elusiveAttacker);
        (engine as any).state.players.opponent.field.push(normalBlocker);
        (engine as any).state.players.opponent.field.push(elusiveBlocker);

        // Attack
        engine.applyAction({ type: 'DECLARE_ATTACKERS', playerId: 'player', attackers: ['id-elu-1'] });

        // Try blocking with Normal (Should fail/log error but not crash, ignoring invalid block)
        engine.applyAction({ type: 'DECLARE_BLOCKERS', playerId: 'opponent', blockers: { 'id-norm-1': 'id-elu-1', 'id-elu-blk': 'id-elu-1' } });

        const state = engine.getState();
        const log = state.log.join(',');
        expect(log).toContain('Invalid block');

        // Verify damage distribution
        // 'id-elu-blk' blocks 'id-elu-1'. Both 1/1. Both die.
        expect(state.players.player.field.length).toBe(0);
        expect(state.players.opponent.field.length).toBe(1); // Normal blocker remains
    });

    it('should handle Burst spells immediately and Flow/Slow on stack', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 333);
        startGame(engine);

        const burstSpell = createRuntimeCard(mockCard('bst', { type: 'Spell' }), 'player', 'id-burst');
        (burstSpell as any).speed = 'Burst';

        const fastSpell = createRuntimeCard(mockCard('fst', { type: 'Spell' }), 'player', 'id-fast');
        (fastSpell as any).speed = 'Fast';

        (engine as any).state.players.player.hand.push(burstSpell);
        (engine as any).state.players.player.hand.push(fastSpell);

        // 1. Play Burst (Immediate)
        engine.applyAction({ type: 'PLAY_CARD', playerId: 'player', cardId: 'id-burst', targetId: 'opponent' });

        let state = engine.getState();
        expect(state.stack.length).toBe(0);
        expect(state.log.join(',')).toContain('Burst spell');
        expect(state.players.opponent.health).toBe(18); // Default effect 2 dmg
        expect(state.priority).toBe('player'); // Burst keeps priority

        // 2. Play Fast (Stack)
        engine.applyAction({ type: 'PLAY_CARD', playerId: 'player', cardId: 'id-fast', targetId: 'opponent' });

        state = engine.getState();
        expect(state.stack.length).toBe(1);
        expect(state.priority).toBe('opponent'); // Passes priority

        // 3. Resolve
        engine.applyAction({ type: 'PASS', playerId: 'opponent' });
        state = engine.getState();
        expect(state.players.opponent.health).toBe(16);
    });

    it('should handle Unit targeting spells and Barrier mechanics', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 555);
        startGame(engine);

        // P1 has Spell. Opponent has Unit with Barrier.
        const spell = createRuntimeCard(mockCard('spell1', { type: 'Spell' }), 'player', 'id-spell');
        const unit = createRuntimeCard(mockCard('barrierUnit', { keywords: ['Barrier' as any], health: 3 }), 'opponent', 'id-unit');
        unit.summoningSickness = false;

        (engine as any).state.players.player.hand.push(spell);
        (engine as any).state.players.opponent.field.push(unit);

        // Play Spell targeting Unit
        // Use Mock target effect: if target is unit, -2 HP.
        engine.applyAction({ type: 'PLAY_CARD', playerId: 'player', cardId: 'id-spell', targetId: 'id-unit' });

        // Resolve Stack
        engine.applyAction({ type: 'PASS', playerId: 'opponent' });

        const state = engine.getState();
        // Unit should take 2 damage. 3 - 2 = 1.
        expect(state.players.opponent.field[0].currentHealth).toBe(1);

        // Clean up log
        const log = state.log.join(',');
        expect(log).toContain('Effect dealt 2 damage to unit');
    });

    it('should end turn when both players pass', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 666);
        startGame(engine); // Turn 1 Started. Active: Player. Priority: Player.

        // Player Passes
        engine.applyAction({ type: 'PASS', playerId: 'player' });
        let state = engine.getState();
        expect(state.priority).toBe('opponent');

        // Opponent Passes -> End Turn -> New Turn
        engine.applyAction({ type: 'PASS', playerId: 'opponent' });

        state = engine.getState();
        // Turn 2. Active: Opponent.
        expect(state.turn).toBe(2);
        expect(state.activePlayer).toBe('opponent');
        // Both players should rely on symmetric mana scaling
        expect(state.players.player.maxMana).toBe(2);
    });

    it('should apply Lifesteal healing in combat', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 777);
        startGame(engine);

        // Reduce Player Health to check healing
        (engine as any).state.players.player.maxHealth = 20;
        (engine as any).state.players.player.health = 10;

        const lifestealUnit = createRuntimeCard(mockCard('ls1', { attack: 5, health: 5, keywords: ['Lifesteal' as any] }), 'player', 'id-ls');
        lifestealUnit.summoningSickness = false;

        (engine as any).state.players.player.field.push(lifestealUnit);

        // Attack Nexus (Direct Hit)
        engine.applyAction({ type: 'DECLARE_ATTACKERS', playerId: 'player', attackers: ['id-ls'] });
        engine.applyAction({ type: 'DECLARE_BLOCKERS', playerId: 'opponent', blockers: {} }); // No blocks

        const state = engine.getState();

        // 1. Damage dealt to Opponent (10 -> 15 damage? No, 5 damage).
        // 20 - 5 = 15.
        expect(state.players.opponent.health).toBe(15);

        // 2. Health Healed (10 + 5 = 15).
        expect(state.players.player.health).toBe(15);

        // 3. Log
        const log = state.log.join(',');
        expect(log).toContain('player healed 5 from Lifesteal');
    });

    it('should export replay data', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 444);
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });

        const replay = engine.exportReplay('Alice', 'Bob');
        expect(replay.metadata.p1Name).toBe('Alice');
        expect(replay.actions.length).toBeGreaterThan(0);
        expect(replay.initialState.seed).toBeDefined();
    });
});
