"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_CARDS = exports.MOCK_SETS = void 0;
exports.getCards = getCards;
exports.getCardById = getCardById;
exports.createDeckFromCardIds = createDeckFromCardIds;
exports.createRandomDeck = createRandomDeck;
// RIFTBOUND TCG DATA (Declarative Effects System v2)
const core_set_v2_json_1 = __importDefault(require("@/data/core_set_v2.json"));
// Riftbound TCG Official Sets
exports.MOCK_SETS = [
    { id: 'set1', name: 'Origins', code: 'ORI', release_date: '2025-01-01', total_cards: 369 },
    { id: 'set2', name: 'Spiritforged', code: 'SPI', release_date: '2026-02-01', total_cards: 220 },
    { id: 'set3', name: 'Proving Grounds', code: 'PG', release_date: '2025-06-01', total_cards: 60 },
    { id: 'set4', name: 'Arcane Box Set', code: 'ARC', release_date: '2025-09-02', total_cards: 6 },
    { id: 'set5', name: 'Origins Organized Play', code: 'OOP', release_date: '2025-03-01', total_cards: 59 },
];
// Cast the JSON data to our Card type
// Using the high-fidelity Riftbound manual dataset
exports.MOCK_CARDS = core_set_v2_json_1.default;
async function getCards(query) {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!query)
        return exports.MOCK_CARDS;
    const lowerQuery = query.toLowerCase();
    return exports.MOCK_CARDS.filter(card => card.name.toLowerCase().includes(lowerQuery) ||
        (card.text && card.text.toLowerCase().includes(lowerQuery)) ||
        card.type.toLowerCase().includes(lowerQuery));
}
async function getCardById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return exports.MOCK_CARDS.find(c => c.id === id);
}
// --- NEW DECK UTILITIES ---
function createDeckFromCardIds(cardIds) {
    return cardIds.map(id => exports.MOCK_CARDS.find(c => c.id === id)).filter(Boolean);
}
function createRandomDeck(size = 30) {
    const deck = [];
    for (let i = 0; i < size; i++) {
        deck.push(exports.MOCK_CARDS[Math.floor(Math.random() * exports.MOCK_CARDS.length)]);
    }
    return deck;
}
