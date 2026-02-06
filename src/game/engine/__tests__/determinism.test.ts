import { describe, it, expect } from 'vitest';
import { CoreEngine } from '../CoreEngine';
import { Card } from '@/lib/database.types';

describe('CoreEngine Determinism & Flow', () => {
    const mockCard = (id: string, type: 'Unit' | 'Spell' = 'Unit', cost = 1, keywords: string[] = []): Card => ({
        id, name: `Card ${id}`, cost, type, rarity: 'Common',
        attack: 1, health: 1, image_url: '', set_id: 'test', collector_number: id,
        subtypes: [], region: 'Test', text: '',
        keywords: keywords as any
    });

    const pDeck = Array.from({ length: 40 }, (_, i) => mockCard(`p${i}`, i % 2 === 0 ? 'Unit' : 'Spell'));
    const oDeck = Array.from({ length: 40 }, (_, i) => mockCard(`o${i}`, 'Unit'));

    it('should be deterministic with the same seed', () => {
        const seed = 12345;

        // Run 1
        const engine1 = new CoreEngine();
        engine1.initGame(pDeck, oDeck, seed);
        engine1.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });
        engine1.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });
        const state1 = engine1.getState();

        // Run 2
        const engine2 = new CoreEngine();
        engine2.initGame(pDeck, oDeck, seed);
        engine2.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });
        engine2.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });
        const state2 = engine2.getState();

        expect(JSON.stringify(state1)).toBe(JSON.stringify(state2));
        expect(state1.players.player.hand[0].id).toBe(state2.players.player.hand[0].id);
    });

    it('should produce different outcomes with different seeds', () => {
        const engine1 = new CoreEngine();
        engine1.initGame(pDeck, oDeck, 11111);

        const engine2 = new CoreEngine();
        engine2.initGame(pDeck, oDeck, 99999);

        // Check initial draws (should be shuffled differently)
        // Note: statistical possibility of same shuffle exists but is low for 40 cards
        const hand1 = engine1.getState().players.player.hand.map(c => c.id).join(',');
        const hand2 = engine2.getState().players.player.hand.map(c => c.id).join(',');

        expect(hand1).not.toBe(hand2);
    });

    it('should handle full game flow (Mulligan Swap, Spell Stack)', () => {
        const engine = new CoreEngine();
        engine.initGame(pDeck, oDeck, 42); // Seed 42

        // 1. Mulligan Swap Logic
        const handBefore = engine.getState().players.player.hand;
        const swapId = handBefore[0].instanceId;

        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [swapId] });
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] });

        const handAfter = engine.getState().players.player.hand;
        expect(handAfter.length).toBe(4);
        expect(handAfter.find(c => c.instanceId === swapId)).toBeUndefined(); // Should be gone

        // 2. Play Spell (Slow) - Add to Stack
        // Inject a Spell
        const spellCard = { ...mockCard('spell1', 'Spell', 1) };
        (spellCard as any).speed = 'Slow';
        (engine as any).state.players.player.hand.push(spellCard);

        // Pass priority to player (Turn 1)
        // P1 Turn. P1 plays Spell.
        engine.applyAction({ type: 'PLAY_CARD', playerId: 'player', cardId: spellCard.id });

        let state = engine.getState();
        expect(state.stack.length).toBe(1);
        expect(state.priority).toBe('opponent'); // Ops priority to react

        // 3. Opponent Passes (Resolves Stack)
        engine.applyAction({ type: 'PASS', playerId: 'opponent' });

        state = engine.getState();
        expect(state.stack.length).toBe(0); // Resolved
        expect(state.log.join(',')).toContain('Effect dealt 2 damage');

        // Priority returns to Active Player (Player)
        expect(state.priority).toBe('player');
    });
});
