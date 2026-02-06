import { HeuristicBot } from '../game/ai/HeuristicBot';
import { SerializedGameState, Action } from '../game/engine/game.types';
import { createRuntimeCard } from '../game/engine/RuntimeCard';
import { MOCK_CARDS } from '../services/card-service';

describe('HeuristicBot Mulligan Logic', () => {
    let bot: HeuristicBot;
    let mockState: SerializedGameState;

    beforeEach(() => {
        bot = new HeuristicBot('opponent', 'TestBot', 'Hard');

        // Setup basic state
        mockState = {
            turn: 0,
            activePlayer: 'player', // Doesn't matter for mulligan logic check
            phase: 'Mulligan',
            priority: 'player',
            players: {
                player: { id: 'player', health: 20, maxHealth: 20, mana: 0, maxMana: 0, hand: [], deckCount: 30, field: [], graveyard: [] },
                opponent: { id: 'opponent', health: 20, maxHealth: 20, mana: 0, maxMana: 0, hand: [], deckCount: 30, field: [], graveyard: [] }
            },
            winner: null,
            log: [],
            combat: null,
            stack: [],
            seed: 123
        };
    });

    it('should keep champions and low cost cards', async () => {
        // Create a hand with mixed costs
        const highCostUnit = { ...MOCK_CARDS[0], id: 'high-unit', cost: 8, type: 'Unit' };
        const lowCostUnit = { ...MOCK_CARDS[0], id: 'low-unit', cost: 2, type: 'Unit' };
        const champion = { ...MOCK_CARDS[0], id: 'champ', cost: 5, rarity: 'Champion', type: 'Unit' };

        const hand = [
            createRuntimeCard(highCostUnit as any, 'opponent'),
            createRuntimeCard(lowCostUnit as any, 'opponent'),
            createRuntimeCard(champion as any, 'opponent')
        ];

        mockState.players.opponent.hand = hand;

        const action = await bot.decideAction(mockState);

        expect(action).not.toBeNull();
        expect(action?.type).toBe('SELECT_MULLIGAN');

        // Should replace ONLY the high cost unit
        // Champion (cost 5) kept because it is Champion
        // Low cost unit (cost 2) kept
        expect(action?.mulliganCards).toContain(hand[0].instanceId);
        expect(action?.mulliganCards).not.toContain(hand[1].instanceId);
        expect(action?.mulliganCards).not.toContain(hand[2].instanceId);
        expect(action?.mulliganCards?.length).toBe(1);
    });

    it('should replace all high cost non-champions', async () => {
        const high1 = { ...MOCK_CARDS[0], id: 'h1', cost: 6 };
        const high2 = { ...MOCK_CARDS[0], id: 'h2', cost: 7 };

        const hand = [
            createRuntimeCard(high1 as any, 'opponent'),
            createRuntimeCard(high2 as any, 'opponent')
        ];

        mockState.players.opponent.hand = hand;

        const action = await bot.decideAction(mockState);

        expect(action?.mulliganCards?.length).toBe(2);
    });
});
