const fs = require('fs');
const https = require('https');
const path = require('path');

// Riot Data Dragon Endpoints for Sets 1-4
const SETS = [
    { id: 'set1', url: 'https://dd.b.pvp.net/latest/set1/en_us/data/set1-en_us.json' },
    { id: 'set2', url: 'https://dd.b.pvp.net/latest/set2/en_us/data/set2-en_us.json' },
    { id: 'set3', url: 'https://dd.b.pvp.net/latest/set3/en_us/data/set3-en_us.json' },
    { id: 'set4', url: 'https://dd.b.pvp.net/latest/set4/en_us/data/set4-en_us.json' }
];

const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'official-cards.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchSet(set) {
    return new Promise((resolve, reject) => {
        console.log(`Fetching ${set.id}...`);
        https.get(set.url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => reject(err));
    });
}

function mapCard(riotCard, setId) {
    // Map Riot Format to our Card Interface
    return {
        id: riotCard.cardCode,
        name: riotCard.name,
        cost: riotCard.cost,
        region: riotCard.regionRefs[0] || 'Runeterra',
        rarity: riotCard.rarity,
        type: riotCard.type, // Unit, Spell, etc.
        subtypes: riotCard.subtypes || [],
        text: riotCard.descriptionRaw || '',
        flavor_text: riotCard.flavorText || '',
        artist: riotCard.artistName || 'Riot Games',
        attack: riotCard.attack,
        health: riotCard.health,
        image_url: riotCard.assets[0]?.gameAbsolutePath || '',
        set_id: setId,
        collector_number: riotCard.cardCode.slice(-3),
        market_price: riotCard.rarity === 'Champion' ? 15.0 : riotCard.rarity === 'Epic' ? 5.0 : riotCard.rarity === 'Rare' ? 1.5 : 0.2, // Simulated Price
        price_change_24h: (Math.random() * 20) - 10 // Volatility
    };
}

async function run() {
    let allCards = [];

    for (const set of SETS) {
        try {
            const rawCards = await fetchSet(set);
            // Filter out tokens/skills (collectible cards only)
            const collectible = rawCards.filter(c => c.collectible);

            const mapped = collectible.map(c => mapCard(c, set.id));
            console.log(`Processes ${mapped.length} cards from ${set.id}`);
            allCards = [...allCards, ...mapped];
        } catch (err) {
            console.error(`Failed to fetch ${set.id}:`, err);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCards, null, 2));
    console.log(`\nSUCCESS! Saved ${allCards.length} Official Cards to ${OUTPUT_FILE}`);
}

run();
