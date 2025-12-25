const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const FILE_PATH = path.join(__dirname, '../src/data/riftbound-data.json');

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/cards') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // Verify JSON
                const json = JSON.parse(body); // Just to check validity
                const arrayData = Array.isArray(json) ? json : Array.from(new Map(json).values());

                fs.writeFileSync(FILE_PATH, JSON.stringify(arrayData, null, 2));
                console.log(`Saved ${arrayData.length} cards to ${FILE_PATH}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: arrayData.length }));

                // Allow some time for response to flush then exit
                setTimeout(() => process.exit(0), 1000);
            } catch (e) {
                console.error('Error parsing/saving:', e);
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Capture server listening on port ${PORT}`);
});
