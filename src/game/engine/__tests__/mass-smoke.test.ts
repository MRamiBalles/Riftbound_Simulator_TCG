
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CoreEngine } from '../CoreEngine';
import { createRuntimeCard } from '../RuntimeCard';
import { Card } from '@/lib/database.types';

// Load Generated Core Set v2
const dataPath = path.join(__dirname, '../../../../src/data/core_set_v2.json');
const allCards: Card[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

describe('Mass Migration Smoke Test', () => {
    // Filter only cards with declarative effects
    const migratedCards = allCards.filter(c => (c as any).effects && (c as any).effects.length > 0);

    console.log(`Testing ${migratedCards.length} migrated cards...`);

    it('Should be able to instantiate and play every migrated card without crashing', () => {
        const engine = new CoreEngine();
        const dummyRef = allCards.find(c => c.id === 'OGN-056') || allCards[0]; // Adaptatron or fallback

        // Setup a dummy game state
        // We put ALL migrated cards in player's hand to test them one by one?
        // Or just one by one in a loop to reset state?
        // Loop is safer to isolate crashes.

        let successCount = 0;
        const failures: string[] = [];

        migratedCards.forEach(card => {
            try {
                // 1. Instantiate
                const runtimeCard = createRuntimeCard(card, 'player');

                // 2. Setup Engine for this card
                const deck = [card]; // Minimal deck
                const oppDeck = [dummyRef];
                engine.initGame(deck, oppDeck, 12345);
                const state = (engine as any).state;

                // Give infinite resources
                state.players.player.mana = 10;
                state.players.player.spellMana = 3;
                state.players.player.field = []; // Clear field
                state.players.opponent.field = [];

                // Add dummy targets for effects
                const dummyTarget = createRuntimeCard(dummyRef, 'opponent');
                state.players.opponent.field.push(dummyTarget);

                // Add card to hand
                state.players.player.hand = [runtimeCard];

                // 3. Play Card
                // note: We assume 'targetId' is the dummy unit if the card needs a target.
                // If the card effects require specific targets (e.g. Ally), this might fail validation in engine but shouldn't CRASH.
                // We just want to ensure NO EXCEPTION is thrown from CoreEngine.

                // If card needs target, we provide one.
                // We blindly provide a targetId?
                const targetId = dummyTarget.instanceId;

                engine.applyAction({
                    type: 'PLAY_CARD',
                    playerId: 'player',
                    cardId: runtimeCard.instanceId,
                    targetId: targetId
                });

                // If it went to stack, resolve it
                if (state.stack.length > 0) {
                    engine.applyAction({ type: 'PASS', playerId: 'opponent' });
                }

                successCount++;
            } catch (e: any) {
                failures.push(`${card.id} (${card.name}): ${e.message}`);
            }
        });

        if (failures.length > 0) {
            console.error('Migration Failures:', JSON.stringify(failures, null, 2));
        }

        expect(failures.length).toBe(0);
        expect(successCount).toBe(migratedCards.length);
    });
});
