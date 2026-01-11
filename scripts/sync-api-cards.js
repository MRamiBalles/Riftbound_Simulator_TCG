/**
 * Riftbound Card Synchronizer - DataOps / GameOps
 * 
 * Fetches the latest card dataset from api.dotgg.gg and populates 
 * semantic fields (text/effect, keywords/tags) in the local json.
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.dotgg.gg/cgfw/getcards?game=riftbound&mode=indexed';
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'riftbound-data.json');

async function syncCards() {
    console.log('🔄 Starting DataOps: Card Semantic Synchronization...');
    
    try {
        // 1. Fetch from API
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const apiData = await response.json();
        
        const fieldNames = apiData.names; // ["id", "slug", "name", "effect", ..., "tags", ...]
        const cardMap = apiData.data;
        
        const effectIdx = fieldNames.indexOf('effect');
        const tagsIdx = fieldNames.indexOf('tags');
        const attackIdx = fieldNames.indexOf('might'); // 'might' is attack in dotgg schema
        
        console.log(`📊 API fields identified. Effect index: ${effectIdx}, Tags index: ${tagsIdx}`);

        // 2. Load Local Data
        if (!fs.existsSync(DATA_PATH)) {
            console.error(`❌ Local data not found at ${DATA_PATH}`);
            return;
        }
        const localData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        
        let updatedCount = 0;
        let missingCount = 0;

        // 3. Merge semantic data
        const updatedData = localData.map(card => {
            const apiCard = cardMap[card.id];
            if (apiCard) {
                updatedCount++;
                return {
                    ...card,
                    text: apiCard[effectIdx] || "",
                    keywords: Array.isArray(apiCard[tagsIdx]) ? apiCard[tagsIdx] : [],
                    attack: card.attack ?? (apiCard[attackIdx] ? parseInt(apiCard[attackIdx]) : undefined)
                };
            } else {
                // Try fuzzy match if ID differs slightly (e.g. suffixes)
                const baseId = card.id.split('-').slice(0, 2).join('-');
                const fuzzyId = Object.keys(cardMap).find(id => id.startsWith(baseId));
                
                if (fuzzyId) {
                    updatedCount++;
                    const fuzzyCard = cardMap[fuzzyId];
                    return {
                        ...card,
                        text: fuzzyCard[effectIdx] || "",
                        keywords: Array.isArray(fuzzyCard[tagsIdx]) ? fuzzyCard[tagsIdx] : []
                    };
                }
                
                missingCount++;
                return card;
            }
        });

        // 4. Save
        fs.writeFileSync(DATA_PATH, JSON.stringify(updatedData, null, 4), 'utf-8');
        
        console.log(`\n✅ Synchronization Complete:`);
        console.log(`   - Cards processed: ${localData.length}`);
        console.log(`   - Semantic fields updated: ${updatedCount}`);
        console.log(`   - Cards skipped (no API match): ${missingCount}`);
        console.log(`\n💾 Data saved to: src/data/riftbound-data.json`);

    } catch (error) {
        console.error('❌ DataSync Critical Failure:', error.message);
    }
}

syncCards();
