import { Card } from '@/lib/database.types';
import OFFICIAL_CARDS_RAW from '@/data/official-cards.json';

const ALL_CARDS = OFFICIAL_CARDS_RAW as unknown as Card[];

export interface StarterDeck {
    id: string;
    name: string;
    description: string;
    regions: string[];
    mainChampions: string[];
    cards: { name: string; count: number }[];
}

export const STARTER_DECKS: StarterDeck[] = [
    {
        id: 'deck-arcane-collection',
        name: 'Arcane Box Set',
        description: 'Featuring the stars of the hit series Arcane.',
        regions: ['Piltover & Zaun'],
        mainChampions: ['Vi - Destructive', 'Caitlyn - Patrolling'],
        cards: [
            { name: 'Vi - Destructive', count: 3 },
            { name: 'Caitlyn - Patrolling', count: 3 },
            { name: 'Heimerdinger - Inventor', count: 3 },
            { name: 'Chemtech Enforcer', count: 3 }, // OGN-003
        ]
    },
    {
        id: 'deck-origins-starter',
        name: 'Origins: First Flame',
        description: 'The fire of Annie burns bright in this starter deck.',
        regions: ['Noxus'],
        mainChampions: ['Annie - Fiery'],
        cards: [
            { name: 'Annie - Fiery', count: 3 },
            { name: 'Blazing Scorcher', count: 3 }, // OGN-001
            { name: 'Cleave', count: 3 }, // OGN-004
        ]
    }
];


// Helper to hydrate decks
export const getHydratedStarterDecks = (): any[] => {
    return STARTER_DECKS.map(deck => {
        const hydratedCards: any[] = [];
        deck.cards.forEach(item => {
            const cardData = ALL_CARDS.find(c => c.name.toLowerCase() === item.name.toLowerCase());
            if (cardData) {
                // Determine foil/normal based on count? Nah, just normal
                hydratedCards.push({
                    card: cardData,
                    count: item.count
                });
            }
        });

        return {
            ...deck,
            coverImage: hydratedCards[0]?.card.image_url,
            totalCards: hydratedCards.reduce((acc, c) => acc + c.count, 0),
            items: hydratedCards
        };
    });
};
