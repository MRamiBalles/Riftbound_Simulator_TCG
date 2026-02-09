
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/data/riftbound-data.json');

const PILOT_UPDATES = {
    // 1. Removal: Vengeance -> Kill selected unit
    'OGN-229': {
        text: "Kill a unit.",
        effects: [
            {
                trigger: 'ON_CAST', // Spell -> ON_CAST
                action: 'KILL',
                target: 'SELECTED_UNIT'
            }
        ]
    },
    // 2. Buff: Gentlemen's Duel -> Give +3/+0 and Overwhelm this turn
    'OGS-008': {
        text: "Give a friendly unit +3 Power and Overwhelm this turn.",
        effects: [
            {
                trigger: 'ON_CAST', // Spell -> ON_CAST
                action: 'BUFF_ATTACK',
                value: 3,
                target: 'SELECTED_ALLY',
                duration: 1
            },
            {
                trigger: 'ON_CAST', // Spell -> ON_CAST
                action: 'GIVE_KEYWORD',
                keyword: 'Overwhelm',
                target: 'SELECTED_ALLY',
                duration: 1
            }
        ]
    },
    // 3. Draw: Lecturing Yordle -> Draw 1 on Play
    'OGN-087': {
        text: "When I'm played, draw 1 card.",
        effects: [
            {
                trigger: 'ON_PLAY', // Unit -> ON_PLAY
                action: 'DRAW',
                value: 1,
                target: 'OWNER'
            }
        ]
    },
    // 4. AoE: Bullet Time -> Deal 2 to all enemies
    'OGN-268': {
        text: "Deal 2 damage to all enemy units.",
        effects: [
            {
                trigger: 'ON_CAST', // Spell -> ON_CAST
                action: 'DAMAGE',
                value: 2,
                target: 'ALL_ENEMIES'
            }
        ]
    },
    // 5. Direct Damage: Acceptable Losses (Reskinned as Fireball)
    'OGN-179': {
        name: "Fireburst", // Renaming for clarity in test
        text: "Deal 3 damage to any unit.",
        effects: [
            {
                trigger: 'ON_CAST', // Spell -> ON_CAST
                action: 'DAMAGE',
                value: 3,
                target: 'SELECTED_UNIT'
            }
        ]
    }
};

function migrate() {
    console.log(`Reading data from ${DATA_PATH}...`);
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    const cards = JSON.parse(rawData);

    let updatedCount = 0;

    const updatedCards = cards.map(card => {
        if (PILOT_UPDATES[card.id]) {
            console.log(`Migrating ${card.id} (${card.name})...`);
            // Check if card has 'effects' already, if not init
            const updates = PILOT_UPDATES[card.id];

            // Merge carefully
            const newCard = { ...card, ...updates };
            updatedCount++;
            return newCard;
        }
        return card;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(updatedCards, null, 4));
        console.log(`Successfully migrated ${updatedCount} cards.`);
    } else {
        console.log("No cards matched for migration.");
    }
}

migrate();
