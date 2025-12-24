import { Card, Set } from '@/lib/database.types';

export const MOCK_SETS: Set[] = [
    { id: 'set-1', name: 'Origins', code: 'ORI', release_date: '2024-01-01', total_cards: 120 },
    { id: 'set-2', name: 'Rising Tides', code: 'RIT', release_date: '2024-04-01', total_cards: 80 },
    { id: 'set-3', name: 'Mountain Call', code: 'COT', release_date: '2024-07-01', total_cards: 90 },
    { id: 'set-4', name: 'Empires', code: 'EMP', release_date: '2024-10-01', total_cards: 110 },
];

const createCard = (id: string, name: string, cost: number, region: string, rarity: any, type: any, stats: [number, number] | null, text: string, imgId: string, set: string, flavor?: string): Card => ({
    id, name, cost, region, rarity, type,
    subtypes: [],
    text,
    image_url: `https://dd.b.pvp.net/latest/set1/en_us/img/cards/${imgId}.png`,
    set_id: set,
    collector_number: id.replace('c', '').padStart(3, '0'),
    market_price: rarity === 'Champion' ? 15.0 : rarity === 'Epic' ? 5.0 : 0.5,
    price_change_24h: (Math.random() * 20) - 10,
    attack: stats ? stats[0] : undefined,
    health: stats ? stats[1] : undefined,
    flavor_text: flavor || "A legend of Runeterra.",
    artist: "Sixmorevodka"
});

const HANDCRAFTED_CARDS: Card[] = [
    // --- SET 1: ORIGINS (Base) ---
    createCard('c1', 'Jinx', 4, 'Piltover & Zaun', 'Champion', 'Legend', [4, 3], 'Level Up: I see your hand empty.', '01PZ040', 'set-1', "Volatile explosives are a girl's best friend!"),
    createCard('c2', 'Garen', 5, 'Demacia', 'Champion', 'Legend', [5, 5], 'Regeneration.', '01DE012', 'set-1', "For Demacia! The vanguard of the Dauntless plays no games."),
    createCard('c3', 'Darius', 6, 'Noxus', 'Champion', 'Legend', [6, 5], 'Overwhelm.', '01NX038', 'set-1', "Strength above all. The weak deserve to be crushed."),
    createCard('c4', 'Zed', 3, 'Ionia', 'Champion', 'Legend', [3, 2], 'Quick Attack.', '01IO009', 'set-1', "Balance is a lie. We are the true shadows."),
    createCard('c5', 'Teemo', 1, 'Piltover & Zaun', 'Champion', 'Legend', [1, 1], 'Elusive. Nexus Strike: Plant 5 Mushrooms.', '01PZ008', 'set-1', "Size doesn't mean everything. Never underestimate the power of the Scout's Code."),
    createCard('c6', 'Lux', 6, 'Demacia', 'Champion', 'Legend', [4, 5], 'Barrier.', '01DE042', 'set-1', "Her light shines brightest when the night is darkest."),
    createCard('c7', 'Anivia', 6, 'Freljord', 'Champion', 'Legend', [2, 4], 'Last Breath: Revive as Eggnivia.', '01FR024', 'set-1', "The winter winds guide her eternal rebirth."),
    createCard('c8', 'Karma', 6, 'Ionia', 'Champion', 'Legend', [4, 3], 'End of Round: Create a random spell.', '01IO041', 'set-1', "Peace begins within. Violence ends within."),
    createCard('c9', 'Thresh', 5, 'Shadow Isles', 'Champion', 'Legend', [3, 6], 'Challenger.', '01SI052', 'set-1', "What is the worth of a soul? Let us find out together."),
    createCard('c10', 'Heimerdinger', 5, 'Piltover & Zaun', 'Champion', 'Legend', [1, 3], 'When you cast a spell, create a Turret.', '01PZ056', 'set-1', "Progress doesn't make itself, you know!"),

    // Set 1 Epics/Rares
    createCard('c11', 'Commander Ledros', 9, 'Shadow Isles', 'Epic', 'Unit', [9, 6], 'Last Breath: Return me to hand.', '01SI033', 'set-1'),
    createCard('c12', 'Corina Veraza', 9, 'Piltover & Zaun', 'Epic', 'Unit', [6, 6], 'Play: Discard 5. Deal damage.', '01PZ048', 'set-1'),
    createCard('c13', 'Deny', 4, 'Ionia', 'Rare', 'Spell', null, 'Stop a fast spell, slow spell, or skill.', '01IO049', 'set-1'),
    createCard('c14', 'Vengeance', 6, 'Shadow Isles', 'Common', 'Spell', null, 'Kill a unit.', '01SI001', 'set-1'),
    createCard('c15', 'Ruination', 9, 'Shadow Isles', 'Epic', 'Spell', null, 'Kill ALL units.', '01SI015', 'set-1'),

    // --- SET 2: RISING TIDES (Bilgewater) ---
    createCard('c16', 'Miss Fortune', 3, 'Bilgewater', 'Champion', 'Legend', [3, 3], 'When allies attack, deal 1 to battling enemies.', '02BW022', 'set-2'),
    createCard('c17', 'Gangplank', 5, 'Bilgewater', 'Champion', 'Legend', [5, 5], 'Overwhelm.', '02BW032', 'set-2'),
    createCard('c18', 'Twisted Fate', 4, 'Bilgewater', 'Champion', 'Legend', [2, 2], 'Play: Pick a Destiny Card.', '02BW026', 'set-2'),
    createCard('c19', 'Fizz', 1, 'Bilgewater', 'Champion', 'Legend', [2, 1], 'When you cast a spell, give me Elusive.', '02BW046', 'set-2'),
    createCard('c20', 'Nautilus', 7, 'Bilgewater', 'Champion', 'Legend', [0, 12], 'Tough. Fearsome.', '02BW005', 'set-2'),
    createCard('c21', 'Riptide Rex', 8, 'Bilgewater', 'Epic', 'Unit', [7, 4], 'Plunder: Cast Cannon Barrage 7 times.', '02BW028', 'set-2'),
    createCard('c22', 'Make it Rain', 2, 'Bilgewater', 'Common', 'Spell', null, 'Deal 1 to three random enemies.', '02BW045', 'set-2'),
    createCard('c23', 'Sejuani', 6, 'Freljord', 'Champion', 'Legend', [5, 6], 'Play: Give an enemy Frostbite and Vulnerable.', '02FR002', 'set-2'),
    createCard('c24', 'Swain', 5, 'Noxus', 'Champion', 'Legend', [3, 6], 'Nexus Strike: Deal 3 to the enemy Nexus.', '02NX007', 'set-2'),

    // --- SET 3: MOUNTAIN CALL (Targon) ---
    createCard('c25', 'Leona', 4, 'Targon', 'Champion', 'Legend', [3, 5], 'Daybreak: Stun the strongest enemy.', '03MT054', 'set-3'),
    createCard('c26', 'Diana', 2, 'Targon', 'Champion', 'Legend', [2, 2], 'Nightfall: Give me Challenger.', '03MT027', 'set-3'),
    createCard('c27', 'Aurelion Sol', 10, 'Targon', 'Champion', 'Legend', [10, 10], 'SpellShield. Play: Invoke.', '03MT087', 'set-3'),
    createCard('c28', 'Soraka', 3, 'Targon', 'Champion', 'Legend', [1, 6], 'Support: Heal me and my supported ally.', '03MT055', 'set-3'),
    createCard('c29', 'Taric', 4, 'Targon', 'Champion', 'Legend', [3, 4], 'Support: Give me and my supported ally Tough.', '03MT008', 'set-3'),
    createCard('c30', 'Hush', 3, 'Targon', 'Rare', 'Spell', null, 'Silence a unit this round.', '03MT085', 'set-3'),
    createCard('c31', 'Sunburst', 6, 'Targon', 'Rare', 'Spell', null, 'Deal 6 to a unit.', '03MT023', 'set-3'),
    createCard('c32', 'Starshaping', 5, 'Targon', 'Common', 'Spell', null, 'Invoke a celestial card.', '03MT084', 'set-3'),

    // --- SET 4: EMPIRES (Shurima/Mixed) ---
    createCard('c33', 'Azir', 3, 'Shurima', 'Champion', 'Legend', [1, 5], 'When allies attack, summon a Sand Soldier.', '04SH003', 'set-4'),
    createCard('c34', 'Nasus', 6, 'Shurima', 'Champion', 'Legend', [2, 2], 'I have +1|+1 for each unit you have slain.', '04SH047', 'set-4'),
    createCard('c35', 'Renekton', 4, 'Shurima', 'Champion', 'Legend', [4, 4], 'Overwhelm.', '04SH020', 'set-4'),
    createCard('c36', 'Sivir', 4, 'Shurima', 'Champion', 'Legend', [5, 3], 'SpellShield.', '04SH020', 'set-4'),
    createCard('c37', 'Lissandra', 3, 'Freljord', 'Champion', 'Legend', [2, 3], 'Tough.', '04FR005', 'set-4'),
    createCard('c38', 'Kindred', 5, 'Shadow Isles', 'Champion', 'Legend', [4, 4], 'Quick Attack.', '04SI005', 'set-4'),
    createCard('c39', 'Viego', 5, 'Shadow Isles', 'Champion', 'Legend', [5, 4], 'Fearsome.', '04SI055', 'set-4'),
    createCard('c40', 'Akshan', 2, 'Shurima', 'Champion', 'Legend', [2, 2], 'When I\'m summoned, summon a Warlord\'s Palace.', '04SH130', 'set-4'),
];

// Procedural Generator for "The Bulk"
const generateBulkCards = (): Card[] => {
    const bulk: Card[] = [];
    let idCounter = 100;

    // --- DATA POOLS ---
    const ADJECTIVES = ['Elite', 'Vanguard', 'Veteran', 'Reckless', 'Cursed', 'Blessed', 'Ancient', 'Swift', 'Armored', 'Mystic'];
    const NOUNS = {
        'Demacia': ['Soldier', 'Knight', 'Ranger', 'Guardian', 'Duelist', 'Shieldbearer'],
        'Noxus': ['Gladiator', 'Assassin', 'Warmonger', 'Spy', 'Legionnaire', 'Battering Ram'],
        'Ionia': ['Monk', 'Ninja', 'Spirit', 'Elder', 'Blade', 'Dancer'],
        'Freljord': ['Yeti', 'Archer', 'Raider', 'Shaman', 'Troll', 'Winter\'s Claw'],
        'Piltover & Zaun': ['Inventor', 'Chemist', 'Bot', 'Thug', 'Investigator', 'Sniper'],
        'Shadow Isles': ['Ghost', 'Specter', 'Undead', 'Horror', 'Mistwraith', 'Soulhelper'],
        'Bilgewater': ['Pirate', 'Merchant', 'Corsair', 'Hunter', 'Gambler', 'Cutthroat'],
        'Targon': ['Climber', 'Starseer', 'Priest', 'Dragon', 'Goat', 'Traveler'],
        'Shurima': ['Sandspinner', 'Raider', 'Nomad', 'Soldier', 'Baccai', 'Scholar']
    };

    const FLAVOR_PREFIXES = [
        "The best offense is a good defense, specifically",
        "Never turn your back on",
        "In the darkest nights,",
        "Legends say that",
        "It is said that",
        "Beware the power of",
        "Only the strong survive",
        "Written in the stars:",
        "Lost in the sands of time,",
        "Forged in the fires of battle,"
    ];

    // Image Pools per Region (Real Card Art URLs for variety)
    const IMAGE_POOLS: Record<string, string[]> = {
        'Demacia': ['01DE001', '01DE012', '01DE042', '01DE002', '01DE020'],
        'Noxus': ['01NX038', '02NX007', '01NX011', '01NX040'],
        'Piltover & Zaun': ['01PZ040', '01PZ008', '01PZ056', '01PZ020', '01PZ030'],
        'Ionia': ['01IO009', '01IO041', '01IO002', '01IO012'],
        'Freljord': ['01FR024', '02FR002', '01FR010', '01FR030'],
        'Shadow Isles': ['01SI052', '01SI033', '01SI001', '01SI020'],
        'Bilgewater': ['02BW022', '02BW032', '02BW026', '02BW046'],
        'Targon': ['03MT054', '03MT027', '03MT087', '03MT008'],
        'Shurima': ['04SH003', '04SH047', '04SH020', '04SH130']
    };

    MOCK_SETS.forEach(set => {
        // Generate ~50 diverse cards per set
        for (let i = 0; i < 50; i++) {
            idCounter++;
            const isRare = Math.random() > 0.8;
            const rarity: any = isRare ? 'Rare' : 'Common'; // Changed Rarity to any to match createCard signature

            // Determine Region based on Set (Weighted)
            let region = 'Demacia';
            if (set.code === 'ORI') region = ['Demacia', 'Noxus', 'Ionia', 'Piltover & Zaun', 'Freljord', 'Shadow Isles'][Math.floor(Math.random() * 6)];
            if (set.code === 'RIT') region = Math.random() > 0.3 ? 'Bilgewater' : 'Noxus';
            if (set.code === 'COT') region = Math.random() > 0.3 ? 'Targon' : 'Ionia';
            if (set.code === 'EMP') region = Math.random() > 0.3 ? 'Shurima' : 'Noxus';

            // Generate Name
            const noun = NOUNS[region as keyof typeof NOUNS]?.[Math.floor(Math.random() * (NOUNS[region as keyof typeof NOUNS]?.length || 1))] || 'Unit';
            const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
            const name = `${adj} ${noun}`;

            // Generate Stats
            const cost = Math.floor(Math.random() * 9) + 1;
            const attack = Math.floor(cost * (0.8 + Math.random() * 0.4));
            const health = Math.floor(cost * (0.8 + Math.random() * 0.4)) + (isRare ? 1 : 0);

            // Generate Image (Random from pool)
            const imgPool = IMAGE_POOLS[region] || IMAGE_POOLS['Demacia'];
            const imgId = imgPool[Math.floor(Math.random() * imgPool.length)];

            // Generate Flavor
            const flavor = `${FLAVOR_PREFIXES[Math.floor(Math.random() * FLAVOR_PREFIXES.length)]} the ${name.toLowerCase()}.`;

            bulk.push(createCard(
                `gen-${set.id}-${i}`,
                name,
                cost,
                region,
                rarity,
                'Unit',
                [attack, health],
                isRare ? `Play: Grant allies +1|+${Math.floor(Math.random() * 2)}` : `Strike: Create a random card in hand.`,
                imgId,
                set.id,
                flavor
            ));
        }
    });
    return bulk;
};

export const MOCK_CARDS: Card[] = [...HANDCRAFTED_CARDS, ...generateBulkCards()];


export async function getCards(query?: string): Promise<Card[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!query) return MOCK_CARDS;
    const lowerQuery = query.toLowerCase();
    return MOCK_CARDS.filter(card =>
        card.name.toLowerCase().includes(lowerQuery) ||
        card.text.toLowerCase().includes(lowerQuery) ||
        card.type.toLowerCase().includes(lowerQuery)
    );
}

export async function getCardById(id: string): Promise<Card | undefined> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Faster response
    return MOCK_CARDS.find(c => c.id === id);
}
