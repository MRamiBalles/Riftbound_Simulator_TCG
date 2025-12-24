import { Card, Set } from '@/lib/database.types';

export const MOCK_SETS: Set[] = [
    { id: 'set-1', name: 'Origins', code: 'ORI', release_date: '2024-01-01', total_cards: 120 },
    { id: 'set-2', name: 'Spiritforged', code: 'SPI', release_date: '2024-06-01', total_cards: 80 },
];

export const MOCK_CARDS: Card[] = [
    {
        id: 'c1',
        name: 'Jinx',
        cost: 4,
        type: 'Legend',
        subtypes: ['Human', 'Zaun'],
        region: 'Piltover & Zaun',
        rarity: 'Champion',
        text: 'When I see a unit die, deal 1 damage to the enemy Nexus. Level Up: I see your hand empty.',
        image_url: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ040.png', // Placeholder from LoR
        set_id: 'set-1',
        collector_number: '001',
        market_price: 15.50,
        price_change_24h: 2.3,
        attack: 4,
        health: 3
    },
    {
        id: 'c2',
        name: 'Garen',
        cost: 5,
        type: 'Legend',
        subtypes: ['Human', 'Demacia', 'Elite'],
        region: 'Demacia',
        rarity: 'Champion',
        text: 'Regeneration. Level Up: I have struck twice.',
        image_url: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01DE012.png',
        set_id: 'set-1',
        collector_number: '002',
        market_price: 12.00,
        price_change_24h: -1.1,
        attack: 5,
        health: 5
    },
    {
        id: 'c3',
        name: 'Mystic Shot',
        cost: 2,
        type: 'Spell',
        subtypes: [],
        region: 'Piltover & Zaun',
        rarity: 'Common',
        text: 'Deal 2 to anything.',
        image_url: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01PZ052.png',
        set_id: 'set-1',
        collector_number: '045',
        market_price: 0.25,
        price_change_24h: 0.0,
    },
    {
        id: 'c4',
        name: 'Vanguard Defender',
        cost: 2,
        type: 'Unit',
        subtypes: ['Elite'],
        region: 'Demacia',
        rarity: 'Common',
        text: 'Tough.',
        image_url: 'https://dd.b.pvp.net/latest/set1/en_us/img/cards/01DE020.png',
        set_id: 'set-1',
        collector_number: '015',
        market_price: 0.10,
        price_change_24h: 0.0,
        attack: 2,
        health: 2
    }
];

export async function getCards(query?: string): Promise<Card[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!query) return MOCK_CARDS;

    const lowerQuery = query.toLowerCase();
    return MOCK_CARDS.filter(card =>
        card.name.toLowerCase().includes(lowerQuery) ||
        card.text.toLowerCase().includes(lowerQuery) ||
        card.type.toLowerCase().includes(lowerQuery)
    );
}

export async function getCardById(id: string): Promise<Card | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CARDS.find(c => c.id === id);
}
