import { CoreEngine } from '../CoreEngine';
import { Card } from '@/lib/database.types';

describe('CoreEngine', () => {
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

    const playerDeck = Array.from({ length: 40 }, (_, i) => mockCard(`p${i}`));
    const opponentDeck = Array.from({ length: 40 }, (_, i) => mockCard(`o${i}`));

    it('should initialize game correctly', () => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);
        const state = engine.getState();

        expect(state.phase).toBe('Mulligan');
        expect(state.players.player.hand.length).toBe(4);
        expect(state.players.opponent.hand.length).toBe(4);
        expect(state.players.player.deckCount).toBe(36);
    });

    it('should progress to turn 1 after mulligan', () => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);

        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });

        const state = engine.getState();
        expect(state.turn).toBe(1);
        expect(state.players.player.maxMana).toBe(1);
        expect(state.players.player.mana).toBe(1);
        expect(state.phase).toBe('Main');
    });

    it('should handle mana scaling on turn progression', () => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });

        // Turn 1 (Player)
        engine.applyAction({ type: 'END_TURN', playerId: 'player' });

        // Turn 2 (Opponent)
        let state = engine.getState();
        expect(state.activePlayer).toBe('opponent');
        expect(state.players.opponent.maxMana).toBe(1);

        engine.applyAction({ type: 'END_TURN', playerId: 'opponent' });

        // Turn 3 (Player)
        state = engine.getState();
        expect(state.activePlayer).toBe('player');
        expect(state.players.player.maxMana).toBe(2);
    });

    it('should implement Regeneration correctly', () => {
        const engine = new CoreEngine();
        engine.initGame(playerDeck, opponentDeck);
        engine.applyAction({ type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] });

        const regenUnit = { ...mockCard('r1'), keywords: ['Regeneration'], health: 5, attack: 1 };
        const state = engine.getState();
        state.players.player.hand.push(regenUnit as any);

        // Play the unit
        engine.applyAction({ type: 'PLAY_CARD', playerId: 'player', cardId: regenUnit.id });

        // Damage the unit
        const deployed = engine.getState().players.player.field[0];
        deployed.currentHealth = 1;

        // End turn and start again
        engine.applyAction({ type: 'END_TURN', playerId: 'player' });
        engine.applyAction({ type: 'END_TURN', playerId: 'opponent' });

        const healed = engine.getState().players.player.field[0];
        expect(healed.currentHealth).toBe(healed.maxHealth);
    });
});
