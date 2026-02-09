
/**
 * Genesis Migration Script
 * Automates the conversion of legacy card text to declarative Effect objects.
 * 
 * Usage: node scripts/genesis_migration.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '../src/data/riftbound-data.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/core_set_v2.json');
const LOG_PATH = path.join(__dirname, '../migration_audit.log');

// Load Data
const cards = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
let migratedCount = 0;
let skippedCount = 0;
const auditLog = [];

function log(msg) {
    console.log(msg);
    auditLog.push(msg);
}

// Helper: Infer Trigger from text/type
function inferTrigger(card) {
    const text = card.text || "";

    // Spells
    if (card.type === 'Spell') {
        if (text.includes('[Reaction]')) return 'ON_CAST'; // Fast
        if (text.includes('[Action]')) return 'ON_CAST';   // Slow
        // Default to Slow/ON_CAST if no keyword
        return 'ON_CAST';
    }

    // Units
    if (card.type === 'Unit') {
        if (text.includes('When you play me')) return 'ON_PLAY';
        if (text.includes('When I attack')) return 'ON_ATTACK'; // Not yet supported in engine fully?
        // Default
        return null;
    }

    return null;
}

// Helper: Map target text to Enum
function inferTarget(targetText, card) {
    const t = targetText.toLowerCase();
    if (t.includes('any unit') || t.includes('target unit') || t.includes('a unit') || t.includes('an enemy unit')) return 'SELECTED_UNIT';
    if (t.includes('all enemy units')) return 'ALL_ENEMIES';
    if (t.includes('all units')) return 'ALL_UNITS';
    if (t.includes('enemy nexus')) return 'OPPONENT';
    if (t.includes('friendly unit')) return 'SELECTED_ALLY';
    if (t.includes('me') || t.includes('self')) return 'SELF';
    return null;
}

function processCard(card) {
    // 1. Skip if already has effects (Pilot cards)
    if (card.effects && card.effects.length > 0) {
        return card;
    }

    const text = card.text || "";
    const effects = [];
    let trigger = inferTrigger(card);

    // If unit doesn't have explicit trigger text, usually implies no effect or passive.
    // If spell, always try to parse effect.

    if (card.type === 'Unit' && !trigger) {
        // Skip passive units for now
        return card;
    }

    // --- REGEX RULES ---

    // 1. DAMAGE
    // "Deal X to Y"
    const damageRegex = /(?:Deal|deal) (\d+) (?:damage )?(?:to )?(.*)/i;
    const damageMatch = text.match(damageRegex);
    if (damageMatch) {
        const val = parseInt(damageMatch[1]);
        const targetStr = damageMatch[2];
        const target = inferTarget(targetStr, card);

        if (target) {
            effects.push({
                trigger: trigger || 'ON_CAST', // Fallback
                action: 'DAMAGE',
                value: val,
                target: target
            });
        }
    }

    // 2. BUFFS
    // "Give ... +X :rb_might: this turn"
    // "Grant ... +X :rb_might:" (Grant usually permanent, Give temporary? Engine supports BUFF_ATTACK which is permanent in current impl?)
    // Current Engine BUFF_ATTACK adds to currentAttack. It doesn't track "this turn".
    // We will treat all as permanent for now or map to BUFF_ATTACK.
    const buffRegex = /(?:Give|Grant) (.+) ([+-]?\d+) (?:.*?might)/i;
    const buffMatch = text.match(buffRegex);
    if (buffMatch) {
        const targetStr = buffMatch[1];
        const val = parseInt(buffMatch[2]);
        const target = inferTarget(targetStr, card);

        if (target) {
            effects.push({
                trigger: trigger || 'ON_CAST',
                action: 'BUFF_ATTACK', // We only have BUFF_ATTACK/HEALTH
                value: val,
                target: target
            });
        }
    }

    // 3. DRAW
    const drawRegex = /Draw (\d+)/i;
    const drawMatch = text.match(drawRegex);
    if (drawMatch) {
        const val = parseInt(drawMatch[1]);
        effects.push({
            trigger: trigger || 'ON_CAST',
            action: 'DRAW',
            value: val,
            target: 'OWNER'
        });
    }

    // 4. KILL
    const killRegex = /Kill (.+?)(?:\.|$)/i; // Non-greedy until dot or end
    const killMatch = text.match(killRegex);
    if (killMatch) {
        const targetStr = killMatch[1];
        const target = inferTarget(targetStr, card);
        if (target) {
            effects.push({
                trigger: trigger || 'ON_CAST',
                action: 'KILL',
                target: target
            });
        }
    }

    // --- FINALIZE ---

    if (effects.length > 0) {
        // Clone card and add effects
        const newCard = { ...card, effects };
        migratedCount++;
        return newCard;
    }

    // No effects found or parsed
    skippedCount++;
    if (card.type === 'Spell') {
        log(`[SKIP] Spell ${card.id} (${card.name}): No effects parsed from "${text}"`);
    }
    return card;
}

// MAIN LOOP
log(`Starting Genesis Migration on ${cards.length} cards...`);

const newCards = cards.map(c => processCard(c));

log(`Migration Complete.`);
log(`Migrated: ${migratedCount}`);
log(`Skipped/Unchanged: ${skippedCount}`);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newCards, null, 4));
fs.writeFileSync(LOG_PATH, auditLog.join('\n'));
log(`Written to ${OUTPUT_PATH}`);
