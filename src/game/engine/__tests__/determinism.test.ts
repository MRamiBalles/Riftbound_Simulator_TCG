import { CoreEngine } from '../CoreEngine';
import { MOCK_CARDS } from '../../services/card-service';

describe('CoreEngine Determinism', () => {
    it('should result in identical states when given the same seed and actions', () => {
        const seed = 12345;
        const deck1 = [MOCK_CARDS[0], MOCK_CARDS[1], MOCK_CARDS[2]];
        const deck2 = [MOCK_CARDS[3], MOCK_CARDS[4], MOCK_CARDS[5]];

        const engine1 = new CoreEngine();
        const engine2 = new CoreEngine();

        engine1.initGame(deck1, deck2, seed);
        engine2.initGame(deck1, deck2, seed);

        // Verify initial state after shuffles/draws
        expect(engine1.getState()).toEqual(engine2.getState());

        // Perform some mock actions
        const actions = [
            { type: 'SELECT_MULLIGAN', playerId: 'player', mulliganCards: [] },
            { type: 'SELECT_MULLIGAN', playerId: 'opponent', mulliganCards: [] },
            { type: 'PASS', playerId: 'player' },
            { type: 'PASS', playerId: 'opponent' }
        ];

        actions.forEach(a => {
            engine1.applyAction(a as any);
            engine2.applyAction(a as any);
        });

        expect(engine1.getState()).toEqual(engine2.getState());
        console.log('✔ Determinism Audit Passed: State hashes match perfectly.');
    });
});
