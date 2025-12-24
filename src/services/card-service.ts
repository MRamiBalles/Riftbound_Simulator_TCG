import { Card, Set } from '@/lib/database.types';

export const MOCK_SETS: Set[] = [
    { id: 'set-1', name: 'Origins', code: 'ORI', release_date: '2024-01-01', total_cards: 120 },
    { id: 'set-2', name: 'Spiritforged', code: 'SPI', release_date: '2024-06-01', total_cards: 80 },
];

// Helper to create cards faster
const createCard = (id: string, name: string, cost: number, region: string, rarity: any, type: any, stats: [number, number] | null, text: string, imgId: string): Card => ({
    id, name, cost, region, rarity, type,
    subtypes: [],
    text,
    image_url: `https://dd.b.pvp.net/latest/set1/en_us/img/cards/${imgId}.png`,
    set_id: 'set-1',
    collector_number: id.replace('c', '').padStart(3, '0'),
    market_price: rarity === 'Champion' ? 15.0 : rarity === 'Epic' ? 5.0 : 0.5,
    price_change_24h: 0,
    attack: stats ? stats[0] : undefined,
    health: stats ? stats[1] : undefined
});

export const MOCK_CARDS: Card[] = [
    // --- CHAMPIONS (High Value) ---
    createCard('c1', 'Jinx', 4, 'Piltover & Zaun', 'Champion', 'Legend', [4, 3], 'Level Up: I see your hand empty.', '01PZ040'),
    createCard('c2', 'Garen', 5, 'Demacia', 'Champion', 'Legend', [5, 5], 'Regeneration.', '01DE012'),
    createCard('c3', 'Darius', 6, 'Noxus', 'Champion', 'Legend', [6, 5], 'Overwhelm.', '01NX038'),
    createCard('c4', 'Zed', 3, 'Ionia', 'Champion', 'Legend', [3, 2], 'Quick Attack.', '01IO009'),
    createCard('c5', 'Lux', 6, 'Demacia', 'Champion', 'Legend', [4, 5], 'Barrier.', '01DE042'),
    createCard('c6', 'Teemo', 1, 'Piltover & Zaun', 'Champion', 'Legend', [1, 1], 'Elusive. Nexus Strike: Plant 5 Mushrooms.', '01PZ008'),

    // --- EPICS (Strong Effects) ---
    createCard('c7', 'Commander Ledros', 9, 'Shadow Isles', 'Epic', 'Unit', [9, 6], 'Last Breath: Return me to hand.', '01SI033'),
    createCard('c8', 'Corina Veraza', 9, 'Piltover & Zaun', 'Epic', 'Unit', [6, 6], 'Play: Discard 5. Deal damage to all enemies.', '01PZ048'),
    createCard('c9', 'The Harrowing', 9, 'Shadow Isles', 'Epic', 'Spell', null, 'Revive the 6 strongest units that died this game.', '01SI003'),
    createCard('c10', 'Minah Swiftfoot', 9, 'Ionia', 'Epic', 'Unit', [6, 5], 'Play: Recall 3 enemies.', '01IO033'),

    // --- RARES (Utility) ---
    createCard('c11', 'Deny', 4, 'Ionia', 'Rare', 'Spell', null, 'Stop a fast spell, slow spell, or skill.', '01IO049'),
    createCard('c12', 'Decimate', 5, 'Noxus', 'Rare', 'Spell', null, 'Deal 4 to the enemy Nexus.', '01NX002'),
    createCard('c13', 'Avalanche', 4, 'Freljord', 'Rare', 'Spell', null, 'Deal 2 to ALL units.', '01FR020'),
    createCard('c14', 'Get Excited!', 3, 'Piltover & Zaun', 'Rare', 'Spell', null, 'To play, discard 1. Deal 3 to anything.', '01PZ039'),
    createCard('c15', 'Bjerg the Wanderer', 4, 'Freljord', 'Rare', 'Unit', [3, 3], 'When summoned, draw a unit with 5+ Power.', '01FR028'),

    // --- COMMONS (The Bulk) ---
    createCard('c16', 'Vanguard Defender', 2, 'Demacia', 'Common', 'Unit', [2, 2], 'Tough.', '01DE020'),
    createCard('c17', 'Legion Rearguard', 1, 'Noxus', 'Common', 'Unit', [3, 2], 'Can\'t block.', '01NX012'),
    createCard('c18', 'Omen Hawk', 1, 'Freljord', 'Common', 'Unit', [1, 1], 'Grant the top 2 allies +1|+1.', '01FR022'),
    createCard('c19', 'Mystic Shot', 2, 'Piltover & Zaun', 'Common', 'Spell', null, 'Deal 2 to anything.', '01PZ052'),
    createCard('c20', 'Shadow Assassin', 3, 'Ionia', 'Common', 'Unit', [2, 1], 'Elusive. When summoned, draw 1.', '01IO057'),
    createCard('c21', 'Arachnoid Horror', 2, 'Shadow Isles', 'Common', 'Unit', [3, 2], 'Fearsome.', '01SI039'),
    createCard('c22', 'Cithria of Cloudfield', 1, 'Demacia', 'Common', 'Unit', [2, 2], 'Elite.', '01DE001'),
    createCard('c23', 'Blade\'s Edge', 1, 'Noxus', 'Common', 'Spell', null, 'Deal 1 to anything.', '01NX034'),
    createCard('c24', 'Zaunite Urchin', 1, 'Piltover & Zaun', 'Common', 'Unit', [2, 1], 'Last Breath: Draw 1.', '01PZ001'),
];

export async function getCards(query?: string): Promise<Card[]> {
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
