
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CoreEngine } from '../CoreEngine';
import { createRuntimeCard } from '../RuntimeCard';
import { Card } from '@/lib/database.types';
import { SerializedGameState } from '../game.types';

// Load updated data directly
const dataPath = path.join(__dirname, '../../../data/riftbound-data.json');
const allCards: Card[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Helper to find card by ID
const getCard = (id: string): Card => {
    const card = allCards.find(c => c.id === id);
    if (!card) throw new Error(`Card ${id} not found in JSON`);
    return card;
};

describe('Phase 4 Pilot Effects Validation', () => {
    let engine: CoreEngine;

    // Pilot Cards
    const fireburst = getCard('OGN-179');
    const vengeance = getCard('OGN-229');
    const gentlemensDuel = getCard('OGS-008');
    const bulletTime = getCard('OGN-268');
    const lecturingYordle = getCard('OGN-087');
    const dummyRef = getCard('OGN-056');

    beforeEach(() => {
        engine = new CoreEngine();
        // Init with a deck containing our test cards for Player
        const playerDeck = [fireburst, vengeance, gentlemensDuel, bulletTime, lecturingYordle];
        const opponentDeck = new Array(10).fill(dummyRef);

        engine.initGame(playerDeck, opponentDeck, 12345);

        // Give infinite mana for testing
        const state = (engine as any).state as SerializedGameState;
        state.players.player.mana = 10;
        state.players.player.spellMana = 3;
    });

    it('Should execute Direct Damage (Fireburst)', () => {
        const state = (engine as any).state as SerializedGameState;
        const opponent = state.players.opponent;

        // Manually add target unit
        const dummyUnit = createRuntimeCard(dummyRef, 'opponent');
        opponent.field.push(dummyUnit);

        // Manually add Fireburst to hand
        const player = state.players.player;
        const fireburstInstance = createRuntimeCard(fireburst, 'player');
        player.hand = [fireburstInstance];

        const initialHealth = dummyUnit.currentHealth;

        // Play Fireburst
        engine.applyAction({
            type: 'PLAY_CARD',
            playerId: 'player',
            cardId: fireburstInstance.instanceId,
            targetId: dummyUnit.instanceId
        });

        // For Spells (Slow/Fast/Burst). Fireburst didn't have speed set in migration script, default is Slow.
        // If Slow, it goes to stack. We need to resolve it.
        // But wait, Fireburst OGN-179 in original data might be Fast or Slow.
        // If it's on stack, damage hasn't happened yet.

        // Check log or stack
        if (state.stack.length > 0) {
            // It's on stack. Pass priority to resolve.
            // Player played, priority -> Opponent. Opponent passes.
            engine.applyAction({ type: 'PASS', playerId: 'opponent' }); // Resolve top
        }

        // Assert damage
        expect(dummyUnit.currentHealth).toBe(initialHealth - 3);
    });

    it('Should execute Removal (Vengeance)', () => {
        const state = (engine as any).state as SerializedGameState;
        const opponent = state.players.opponent;
        const dummyUnit = createRuntimeCard(dummyRef, 'opponent');
        opponent.field.push(dummyUnit);

        const player = state.players.player;
        const vengeanceInstance = createRuntimeCard(vengeance, 'player');
        player.hand = [vengeanceInstance];

        engine.applyAction({
            type: 'PLAY_CARD',
            playerId: 'player',
            cardId: vengeanceInstance.instanceId,
            targetId: dummyUnit.instanceId
        });

        if (state.stack.length > 0) {
            engine.applyAction({ type: 'PASS', playerId: 'opponent' });
        }

        // Assert Death
        const unitOnField = opponent.field.find(u => u.instanceId === dummyUnit.instanceId);
        expect(unitOnField).toBeUndefined();
    });

    it('Should execute Buff (Gentlemens Duel)', () => {
        const state = (engine as any).state as SerializedGameState;
        const player = state.players.player;
        const myUnit = createRuntimeCard(dummyRef, 'player');
        player.field.push(myUnit);

        const buffCard = createRuntimeCard(gentlemensDuel, 'player');
        player.hand = [buffCard];

        const initialAttack = myUnit.currentAttack;

        engine.applyAction({
            type: 'PLAY_CARD',
            playerId: 'player',
            cardId: buffCard.instanceId,
            targetId: myUnit.instanceId
        });

        if (state.stack.length > 0) {
            // Opponent passes to resolve
            engine.applyAction({ type: 'PASS', playerId: 'opponent' });
        }

        expect(myUnit.currentAttack).toBe(initialAttack + 3);
        expect(myUnit.keywords).toContain('Overwhelm');
    });

    it('Should execute AoE (Bullet Time)', () => {
        const state = (engine as any).state as SerializedGameState;
        const opponent = state.players.opponent;
        const u1 = createRuntimeCard(dummyRef, 'opponent');
        const u2 = createRuntimeCard(dummyRef, 'opponent');
        opponent.field.push(u1, u2);

        const player = state.players.player;
        const splashCard = createRuntimeCard(bulletTime, 'player');
        player.hand = [splashCard];

        engine.applyAction({
            type: 'PLAY_CARD',
            playerId: 'player',
            cardId: splashCard.instanceId
        });

        if (state.stack.length > 0) {
            engine.applyAction({ type: 'PASS', playerId: 'opponent' });
        }

        expect(u1.currentHealth).toBe(u1.maxHealth - 2);
        expect(u2.currentHealth).toBe(u2.maxHealth - 2);
    });

    it('Should execute Draw on Play (Lecturing Yordle)', () => {
        const state = (engine as any).state as SerializedGameState;
        const player = state.players.player;

        player.deck.push(createRuntimeCard(dummyRef, 'player'));

        const yordle = createRuntimeCard(lecturingYordle, 'player');
        player.hand = [yordle];

        engine.applyAction({
            type: 'PLAY_CARD',
            playerId: 'player',
            cardId: yordle.instanceId
        });

        // Units resolve immediately on play usually (unless they go to stack? In LoR units are burst-speed technically for summon, play effects happen)
        // CoreEngine logic: handlePlayCard -> triggers ON_PLAY immediately for Units.

        expect(player.field.length).toBe(1);
        expect(player.hand.length).toBe(1); // Drawn card
        expect(player.hand[0].instanceId).not.toBe(yordle.instanceId);
    });
});
