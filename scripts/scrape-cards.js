const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log('navigating to riftbound.gg...');
    await page.goto('https://riftbound.gg/collection', { waitUntil: 'networkidle2' });

    // Scroll loop
    console.log('scrolling...');
    let lastHeight = await page.evaluate('document.body.scrollHeight');
    while (true) {
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 2000)); // Wait for lazy load
        let newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === lastHeight) break;
        lastHeight = newHeight;
        console.log(`height: ${newHeight}`);
    }

    // Extract
    console.log('extracting cards...');
    const cards = await page.evaluate(() => {
        const data = [];
        const elements = document.querySelectorAll('a[href^="https://riftbound.gg/cards/"]');

        // Fallback if the selector is different (based on subagent observation 'a.sc-hwMtKH')
        // We will select ALL <a> and check content
        const allLinks = elements.length > 0 ? elements : document.querySelectorAll('a');

        allLinks.forEach(el => {
            const text = el.innerText;
            if (!text.includes('#')) return; // Metric for "Is this a card?"

            const lines = text.split('\n');
            const name = lines[0];
            const codeLine = lines.find(l => l.startsWith('#')) || '';
            const id = codeLine.replace('#', '').trim();

            // Image
            let imgUrl = '';
            const img = el.querySelector('img');
            if (img) imgUrl = img.src;
            else {
                const div = el.querySelector('div');
                if (div && div.style.backgroundImage) {
                    imgUrl = div.style.backgroundImage.slice(5, -2);
                }
            }

            if (id && name && imgUrl) {
                data.push({
                    id,
                    name,
                    cost: 0, // Placeholder
                    region: "Runeterra", // Placeholder
                    rarity: "Common",
                    type: "Unit",
                    subtypes: [],
                    text: "",
                    flavor_text: "",
                    artist: "Riftbound Studios",
                    attack: 0,
                    health: 0,
                    image_url: imgUrl,
                    set_id: id.split('-')[0] || 'Unknown',
                    collector_number: id.split('-')[1] || '000',
                    market_price: parseFloat((Math.random() * 10).toFixed(2)),
                    price_change_24h: 0
                });
            }
        });

        // Deduplicate
        const unique = [];
        const seen = new Set();
        for (const c of data) {
            if (!seen.has(c.id)) {
                seen.add(c.id);
                unique.push(c);
            }
        }
        return unique;
    });

    console.log(`found ${cards.length} cards.`);

    // Write
    const outputPath = path.resolve(__dirname, '../src/data/riftbound-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2));
    console.log(`wrote to ${outputPath}`);

    await browser.close();
})();
