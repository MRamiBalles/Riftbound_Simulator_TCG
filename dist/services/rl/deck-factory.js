"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeckFactory = void 0;
const card_service_1 = require("../card-service");
class DeckFactory {
    /**
     * Generates a legal deck based on an archetype.
     */
    static generateDeck(archetype = 'Random') {
        let deck = [];
        const pool = card_service_1.MOCK_CARDS.filter(c => c.type === 'Unit' || c.type === 'Spell');
        // Settings based on archetype
        const settings = {
            'Aggro': { maxCost: 3, unitWeight: 0.7 },
            'Control': { minCost: 4, unitWeight: 0.4 },
            'Midrange': { minCost: 2, maxCost: 5, unitWeight: 0.6 },
            'Random': { unitWeight: 0.5 }
        }[archetype];
        const getWeightedCard = () => {
            const isUnit = Math.random() < settings.unitWeight;
            const typeFilter = isUnit ? 'Unit' : 'Spell';
            let filtered = pool.filter(c => c.type === typeFilter);
            if (settings.maxCost)
                filtered = filtered.filter(c => parseInt(String(c.cost || '0')) <= settings.maxCost);
            if (settings.minCost)
                filtered = filtered.filter(c => parseInt(String(c.cost || '0')) >= settings.minCost);
            if (filtered.length === 0)
                return pool[Math.floor(Math.random() * pool.length)];
            return filtered[Math.floor(Math.random() * filtered.length)];
        };
        // Fill with Champions first (max 6)
        const champions = card_service_1.MOCK_CARDS.filter(c => c.rarity === 'Champion' || c.type === 'Legend');
        const numChamps = Math.floor(Math.random() * 4) + 3; // 3 to 6 champs
        for (let i = 0; i < numChamps; i++) {
            const champ = champions[Math.floor(Math.random() * champions.length)];
            if (deck.filter(c => c.id === champ.id).length < 3) {
                deck.push(champ);
            }
        }
        // Fill remaining with archetype cards
        while (deck.length < 40) {
            const card = getWeightedCard();
            if (deck.filter(c => c.id === card.id).length < 3) {
                deck.push(card);
            }
        }
        return deck;
    }
    /**
     * Batch generates a set of decks for a training session.
     */
    static batchGenerate(count) {
        const batch = [];
        const archetypes = ['Aggro', 'Control', 'Midrange', 'Random'];
        for (let i = 0; i < count; i++) {
            const arch = archetypes[i % archetypes.length];
            batch.push({
                name: `RL_Gen_${arch}_${i}`,
                cards: this.generateDeck(arch)
            });
        }
        return batch;
    }
    /**
     * Meta Templates for focused training.
     */
    static getMetaTemplates() {
        return {
            'Noxus_Aggro': ['OGN-001', 'OGN-002', 'SFD-012', 'SFD-013'], // Base IDs
            'Demacia_Elite': ['OGN-170', 'OGN-171', 'SFD-001', 'SFD-002'],
            'Freljord_Control': ['OGN-148', 'SFD-080', 'OGN-056']
        };
    }
    /**
     * Mutates a deck by swapping a percentage of its cards.
     */
    static mutateDeck(deck, mutationRate = 0.1) {
        const newDeck = [...deck];
        const cardsToSwap = Math.floor(40 * mutationRate);
        for (let i = 0; i < cardsToSwap; i++) {
            const index = Math.floor(Math.random() * 40);
            const replacement = card_service_1.MOCK_CARDS[Math.floor(Math.random() * card_service_1.MOCK_CARDS.length)];
            // Temporary simple swap (might violate 3 copy rule, so we should check)
            if (newDeck.filter(c => c.id === replacement.id).length < 3) {
                newDeck[index] = replacement;
            }
        }
        // Validate and fix if necessary (omitted for brevity, but recommended)
        return newDeck;
    }
}
exports.DeckFactory = DeckFactory;
