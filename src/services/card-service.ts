export type { Card, Set } from '@/lib/database.types';
import { Card, Set } from '@/lib/database.types';

// RIFTBOUND TCG DATA (Manual Override for Authenticity)
import RIFTBOUND_DATA from '@/data/riftbound-data.json';

// Riftbound TCG Official Sets
export const MOCK_SETS: Set[] = [
    { id: 'set1', name: 'Origins', code: 'ORI', release_date: '2025-01-01', total_cards: 369 },
    { id: 'set2', name: 'Spiritforged', code: 'SPI', release_date: '2026-02-01', total_cards: 220 },
    { id: 'set3', name: 'Proving Grounds', code: 'PG', release_date: '2025-06-01', total_cards: 60 },
    { id: 'set4', name: 'Arcane Box Set', code: 'ARC', release_date: '2025-09-02', total_cards: 6 },
    { id: 'set5', name: 'Origins Organized Play', code: 'OOP', release_date: '2025-03-01', total_cards: 59 },
];


// Cast the JSON data to our Card type
// Using the high-fidelity Riftbound manual dataset
export const MOCK_CARDS: Card[] = RIFTBOUND_DATA as unknown as Card[];

export async function getCards(query?: string): Promise<Card[]> {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!query) return MOCK_CARDS;

    const lowerQuery = query.toLowerCase();
    return MOCK_CARDS.filter(card =>
        card.name.toLowerCase().includes(lowerQuery) ||
        (card.text && card.text.toLowerCase().includes(lowerQuery)) ||
        card.type.toLowerCase().includes(lowerQuery)
    );
}

export async function getCardById(id: string): Promise<Card | undefined> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_CARDS.find(c => c.id === id);
}

// --- NEW DECK UTILITIES ---

export function createDeckFromCardIds(cardIds: string[]): Card[] {
    return cardIds.map(id => MOCK_CARDS.find(c => c.id === id)).filter(Boolean) as Card[];
}

export function createRandomDeck(size: number = 30): Card[] {
    const deck: Card[] = [];
    for (let i = 0; i < size; i++) {
        deck.push(MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)]);
    }
    return deck;
}
