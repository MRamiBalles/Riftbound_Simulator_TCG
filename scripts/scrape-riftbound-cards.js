/**
 * Riftbound TCG Card Scraper - Optimized Edition
 * 
 * Extracts ALL cards from riftbound.gg/collection across all sets.
 * 
 * Usage: node scripts/scrape-riftbound-cards.js
 * Output: src/data/riftbound-data.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://riftbound.gg';
const COLLECTION_URL = `${BASE_URL}/collection`;
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'riftbound-data.json');
const DELAY_MS = 500; // Polite delay between requests

// Known sets for validation
const EXPECTED_SETS = ['OGS', 'ORI', 'SPI', 'PG', 'ARC', 'OOP'];

/**
 * Fetches HTML from a URL with retry logic
 */
async function fetchHTML(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (err) {
            console.warn(`Attempt ${i + 1} failed for ${url}: ${err.message}`);
            if (i === retries - 1) throw err;
            await sleep(1000 * (i + 1)); // Exponential backoff
        }
    }
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parses card data from the collection page HTML
 * This is a simplified parser - adjust selectors based on actual site structure
 */
function parseCardsFromHTML(html) {
    const cards = [];

    // Match card data from script tags or data attributes
    // Riftbound.gg likely uses React/Next.js, so data may be in __NEXT_DATA__ or similar

    // Try to find __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nextDataMatch) {
        try {
            const data = JSON.parse(nextDataMatch[1]);
            // Navigate to cards in the page props (structure varies)
            const pageProps = data?.props?.pageProps;
            if (pageProps?.cards) {
                return pageProps.cards.map(normalizeCard);
            }
            if (pageProps?.collection) {
                return pageProps.collection.map(normalizeCard);
            }
            // Deep search for card arrays
            const foundCards = findCardsInObject(pageProps);
            if (foundCards.length > 0) return foundCards;
        } catch (e) {
            console.warn('Failed to parse __NEXT_DATA__:', e.message);
        }
    }

    // Fallback: Try to find card data in other script tags
    const scriptMatches = html.matchAll(/<script[^>]*>([^<]*cards[^<]*)<\/script>/gi);
    for (const match of scriptMatches) {
        try {
            // Look for JSON-like structures
            const jsonMatch = match[1].match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed[0]?.name) {
                    return parsed.map(normalizeCard);
                }
            }
        } catch (e) { /* continue */ }
    }

    // Fallback: Parse HTML elements directly
    const cardRegex = /<div[^>]*data-card-id="([^"]+)"[^>]*data-card-name="([^"]+)"[^>]*>/gi;
    let match;
    while ((match = cardRegex.exec(html)) !== null) {
        cards.push({
            id: match[1],
            name: match[2],
        });
    }

    return cards;
}

/**
 * Recursively search for card arrays in nested object
 */
function findCardsInObject(obj, depth = 0) {
    if (depth > 10 || !obj) return [];

    if (Array.isArray(obj)) {
        if (obj.length > 0 && obj[0]?.name && (obj[0]?.id || obj[0]?.cardId)) {
            return obj.map(normalizeCard);
        }
        for (const item of obj) {
            const found = findCardsInObject(item, depth + 1);
            if (found.length > 0) return found;
        }
    } else if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            if (key.toLowerCase().includes('card') || key === 'items' || key === 'data') {
                const found = findCardsInObject(obj[key], depth + 1);
                if (found.length > 0) return found;
            }
        }
        // Deep search all keys
        for (const key of Object.keys(obj)) {
            const found = findCardsInObject(obj[key], depth + 1);
            if (found.length > 0) return found;
        }
    }
    return [];
}

/**
 * Normalizes card data to our schema
 */
function normalizeCard(raw) {
    return {
        id: raw.id || raw.cardId || raw.card_id || `UNKNOWN-${Date.now()}`,
        name: raw.name || raw.cardName || 'Unknown Card',
        image_url: raw.image_url || raw.imageUrl || raw.image || `https://static.dotgg.gg/riftbound/cards/${raw.id || raw.cardId}.webp`,
        set_code: raw.set_code || raw.setCode || raw.set || extractSetCode(raw.id || ''),
        cost: parseInt(raw.cost || raw.manaCost || 0, 10),
        attack: raw.attack != null ? parseInt(raw.attack, 10) : undefined,
        health: raw.health != null ? parseInt(raw.health, 10) : undefined,
        type: raw.type || raw.cardType || 'Unit',
        rarity: raw.rarity || 'Common',
        text: raw.text || raw.description || raw.effect || undefined,
        keywords: raw.keywords || [],
    };
}

/**
 * Extracts set code from card ID (e.g., "OGS-001" -> "OGS")
 */
function extractSetCode(id) {
    const match = id.match(/^([A-Z]+)-/);
    return match ? match[1] : 'UNK';
}

/**
 * Main scraping function
 */
async function scrapeAllCards() {
    console.log('🔍 Starting Riftbound TCG Card Scraper...\n');

    const allCards = [];
    const seenIds = new Set();

    // Try main collection page first
    console.log(`📥 Fetching ${COLLECTION_URL}...`);
    try {
        const html = await fetchHTML(COLLECTION_URL);
        const cards = parseCardsFromHTML(html);

        for (const card of cards) {
            if (!seenIds.has(card.id)) {
                seenIds.add(card.id);
                allCards.push(card);
            }
        }
        console.log(`   Found ${cards.length} cards on main page`);
    } catch (err) {
        console.error(`❌ Failed to fetch collection page: ${err.message}`);
    }

    // Try individual set pages
    for (const setCode of EXPECTED_SETS) {
        const setUrl = `${COLLECTION_URL}?set=${setCode}`;
        console.log(`📥 Fetching set ${setCode}...`);

        try {
            await sleep(DELAY_MS);
            const html = await fetchHTML(setUrl);
            const cards = parseCardsFromHTML(html);

            let newCards = 0;
            for (const card of cards) {
                if (!seenIds.has(card.id)) {
                    seenIds.add(card.id);
                    allCards.push(card);
                    newCards++;
                }
            }
            console.log(`   Found ${cards.length} cards (${newCards} new)`);
        } catch (err) {
            console.warn(`   ⚠️ Failed: ${err.message}`);
        }
    }

    // Try cards listing page
    const cardsUrl = `${BASE_URL}/cards`;
    console.log(`📥 Fetching ${cardsUrl}...`);
    try {
        await sleep(DELAY_MS);
        const html = await fetchHTML(cardsUrl);
        const cards = parseCardsFromHTML(html);

        let newCards = 0;
        for (const card of cards) {
            if (!seenIds.has(card.id)) {
                seenIds.add(card.id);
                allCards.push(card);
                newCards++;
            }
        }
        console.log(`   Found ${cards.length} cards (${newCards} new)`);
    } catch (err) {
        console.warn(`   ⚠️ Failed: ${err.message}`);
    }

    // Sort by ID
    allCards.sort((a, b) => a.id.localeCompare(b.id));

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total unique cards: ${allCards.length}`);

    const setGroups = {};
    for (const card of allCards) {
        setGroups[card.set_code] = (setGroups[card.set_code] || 0) + 1;
    }
    for (const [set, count] of Object.entries(setGroups)) {
        console.log(`   - ${set}: ${count} cards`);
    }

    // Save
    console.log(`\n💾 Saving to ${OUTPUT_PATH}...`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allCards, null, 4), 'utf-8');
    console.log('✅ Done!');

    return allCards;
}

// Run
scrapeAllCards().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
