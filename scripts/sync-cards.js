const fs = require('fs');
const path = require('path');

// Riftbound API Configuration
const API_URL = "https://api.dotgg.gg/cgfw/getcards?game=riftbound&mode=indexed&cache=3931";
const DATA_FILE = path.join(__dirname, '../src/data/riftbound-data.json');

async function syncCards() {
    console.log("Fetching Riftbound card data...");
    try {
        const response = await fetch(API_URL);
        const json = await response.json();

        if (!json.data || !json.names) {
            throw new Error("Invalid API response format");
        }

        const keys = json.names;
        const rawCards = json.data;

        console.log(`Processing ${rawCards.length} entries...`);

        const processedCards = rawCards.map(row => {
            const card = {};
            keys.forEach((key, index) => {
                card[key] = row[index];
            });

            // Transformation Logic
            const result = {
                id: card.id,
                name: card.name,
                cost: card.cost,
                type: card.type,
                rarity: card.rarity,
                image_url: `https://static.dotgg.gg/riftbound/cards/${card.id}.webp`,
                text: card.text ? card.text.replace(/<[^>]*>/g, '').replace(/_/g, '') : "",
                set_name: card.set_name,
                set_id: card.set_id
            };

            // Parse Might (Attack/Health)
            if (card.might) {
                const parts = card.might.split('/');
                if (parts.length === 2) {
                    result.attack = parseInt(parts[0]);
                    result.health = parseInt(parts[1]);
                } else {
                    const val = parseInt(card.might);
                    if (!isNaN(val)) result.attack = val;
                }
            }

            return result;
        });

        // Filter out empty entries if any
        const finalCards = processedCards.filter(c => c.id && c.name);

        fs.writeFileSync(DATA_FILE, JSON.stringify(finalCards, null, 4));
        console.log(`Successfully synced ${finalCards.length} cards to ${DATA_FILE}`);

    } catch (error) {
        console.error("Sync failed:", error.message);
        process.exit(1);
    }
}

syncCards();
