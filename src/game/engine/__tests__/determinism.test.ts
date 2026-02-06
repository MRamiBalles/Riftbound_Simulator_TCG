import { CoreEngine } from '../CoreEngine';
import { Card } from '@/lib/database.types';

describe('CoreEngine Determinism', () => {
    const mockCard = (id: string): Card => ({
        id,
        name: `Card ${id}`,
        cost: 1,
        type: 'Unit',
        rarity: 'Common',
        attack: 1,
        health: 1,
        image_url: '',
        set_id: 'test',
        collector_number: id,
        subtypes: [],
        region: 'Test',
        text: ''
    });

    const deck = Array.from({ length: 40 }, (_, i) => mockCard(`c${i}`));

    it('should produce identical states given the same seed', () => {
        const engine1 = new CoreEngine();
        const engine2 = new CoreEngine();

        // Init with same decks AND SAME SEED
        engine1.initGame([...deck], [...deck], 12345);
        engine2.initGame([...deck], [...deck], 12345);

        // Perform sequence
        const actions: any[] = [
            { type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] },
            { type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] },
            { type: 'END_TURN', playerId: 'player' },
            { type: 'END_TURN', playerId: 'opponent' }
        ];

        actions.forEach(a => {
            engine1.applyAction(a);
            engine2.applyAction(a);
        });

        const s1 = engine1.getState();
        const s2 = engine2.getState();

        // Check essential properties
        expect(s1.turn).toBe(s2.turn);
        expect(s1.activePlayer).toBe(s2.activePlayer);
        // Hands should be identical if shuffling was deterministic
        expect(s1.players.player.hand.map(c => c.id)).toEqual(s2.players.player.hand.map(c => c.id));

        // Deep equality check
        expect(JSON.stringify(s1)).toBe(JSON.stringify(s2));
    });

    it('should diverge with different seeds', () => {
        const engine1 = new CoreEngine();
        const engine2 = new CoreEngine();

        // Different seeds shoud produce different initial hands
        engine1.initGame([...deck], [...deck], 11111);
        engine2.initGame([...deck], [...deck], 99999);

        const h1 = engine1.getState().players.player.hand.map(c => c.id);
        const h2 = engine2.getState().players.player.hand.map(c => c.id);

        // Random shuffle should produce different results
        expect(h1).not.toEqual(h2);
    });

    it('should shuffle deterministically based on initial seed', () => {
        const engine1 = new CoreEngine();
        engine1.initGame([...deck], [...deck], 55555);

        const engine2 = new CoreEngine();
        engine2.initGame([...deck], [...deck], 55555);

        const h1 = engine1.getState().players.player.hand.map(c => c.id);
        const h2 = engine2.getState().players.player.hand.map(c => c.id);

        expect(h1).toEqual(h2);
    });
});
