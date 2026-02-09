
/**
 * Genesis Migration Script v3
 * High-coverage heuristics for mass-migrating Riftbound cards.
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '../src/data/riftbound-data.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/core_set_v2.json');
const LOG_PATH = path.join(__dirname, '../migration_audit.log');

const cards = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
let migratedCount = 0;
let skippedCount = 0;
const auditLog = [];

function log(msg) {
    console.log(msg);
    auditLog.push(msg);
}

function inferTrigger(card) {
    const text = card.text || "";
    if (card.type === 'Spell') return 'ON_CAST';

    if (card.type === 'Unit' || card.type === 'Champion') {
        if (text.includes('When you play me')) return 'ON_PLAY';
        if (text.includes('When I attack')) return 'ON_ATTACK';
        if (text.includes('When I defend')) return 'ON_DEFEND';
        if (text.includes('When I strike')) return 'ON_STRIKE';
        if (text.includes('When I die') || text.includes('Last Breath') || text.includes('When I leave the board')) return 'ON_DEATH';
        if (text.includes('At the start of your turn')) return 'ON_TURN_START';
        if (text.includes('At the end of your turn')) return 'ON_TURN_END';
        if (text.includes('When you play a spell')) return 'ON_SPELL_CAST';
        if (text.includes('When an enemy unit attacks')) return 'ON_ENEMY_SUMMON'; // Approximate
    }
    return null;
}

function inferTarget(targetText, card) {
    if (!targetText) return null;
    const t = targetText.toLowerCase();

    if (t.includes('any unit') || t.includes('target unit') || t.includes('a unit') || t.includes('an enemy unit') || t.includes('enemy gear')) return 'SELECTED_UNIT';
    if (t.includes('all enemy units') || t.includes('all enemys')) return 'ALL_ENEMIES';
    if (t.includes('all units')) return 'ALL_UNITS';
    if (t.includes('enemy nexus') || t.includes("opponent's nexus") || t.includes('enemy base') || t.includes('opponent controls')) return 'ENEMY_NEXUS';
    if (t.includes('friendly unit') || t.includes('a friendly unit') || t.includes('an ally')) return 'SELECTED_ALLY';
    if (t.includes('me') || t.includes('self')) return 'SELF';
    if (t.includes('nexus') && (t.includes('your') || t.includes('my'))) return 'OWNER_NEXUS';
    return 'SELECTED_UNIT'; // Default fallback for spells
}

const KEYWORDS = [
    'Barrier', 'Challenger', 'Double Attack', 'Elusive', 'Ephemeral',
    'Fearsome', 'Fury', 'Last Breath', 'Lifesteal', 'Overwhelm',
    'Quick Attack', 'Regeneration', 'Scout', 'Spellshield', 'Tough',
    'Vulnerable', 'Rush', 'Ganking', 'Tank', 'Shield', 'Assault'
];

function processCard(card) {
    if (card.effects && card.effects.length > 0) return card;

    const text = card.text || "";
    const effects = [];
    const trigger = inferTrigger(card);

    // 1. DAMAGE
    const damageRegex = /(?:Deal|deal|deals) (\d+) (?:damage )?(?:to )?(.+?)(?:\.|$)/i;
    const damageMatch = text.match(damageRegex);
    if (damageMatch) {
        const val = parseInt(damageMatch[1]);
        const target = inferTarget(damageMatch[2], card);
        effects.push({ trigger: trigger || 'ON_CAST', action: 'DAMAGE', value: val, target });
    }

    // 2. BUFFS
    const buffRegex = /(?:Give|Grant|get|Buff) (.+?) ([+-]?\d+) (?:might|attack|life|health|toughness)/i;
    const buffMatch = text.match(buffRegex);
    if (buffMatch) {
        const target = inferTarget(buffMatch[1], card) || 'SELF';
        const val = parseInt(buffMatch[2]);
        const isHp = /life|health|toughness/.test(text.toLowerCase());
        effects.push({ trigger: trigger || 'ON_CAST', action: isHp ? 'BUFF_HEALTH' : 'BUFF_ATTACK', value: val, target });
    }

    // 3. DRAW / RECYCLE
    const drawRegex = /(?:Draw|Recycle) (\d+)/i;
    const drawMatch = text.match(drawRegex);
    if (drawMatch) {
        effects.push({ trigger: trigger || 'ON_CAST', action: 'DRAW', value: parseInt(drawMatch[1]), target: 'OWNER' });
    }

    // 4. KILL / OBLITERATE / DESTROY
    const killRegex = /(?:Kill|Obliterate|Destroy) (.+?)(?:\.|$)/i;
    const killMatch = text.match(killRegex);
    if (killMatch) {
        const target = inferTarget(killMatch[1], card);
        if (target) effects.push({ trigger: trigger || 'ON_CAST', action: 'KILL', target });
    }

    // 5. STUN
    const stunRegex = /(?:Stun) (.+?)(?:\.|$)/i;
    const stunMatch = text.match(stunRegex);
    if (stunMatch) {
        const target = inferTarget(stunMatch[1], card);
        if (target) effects.push({ trigger: trigger || 'ON_CAST', action: 'STUN', target });
    }

    // 6. RECALL
    const recallRegex = /(?:Recall|Return) (.+?) (?:to हाथ|to hand|to its owner's hand)/i;
    const recallMatch = text.match(recallRegex);
    if (recallMatch) {
        const target = inferTarget(recallMatch[1], card);
        if (target) effects.push({ trigger: trigger || 'ON_CAST', action: 'RECALL', target });
    }

    // 7. SUMMON
    const summonRegex = /(?:Play|Summon) (?:a )?(\d+) (?:.*?) (?:unit )?token/i;
    const summonMatch = text.match(summonRegex);
    if (summonMatch) {
        effects.push({ trigger: trigger || 'ON_PLAY', action: 'SUMMON', value: parseInt(summonMatch[1]), target: 'OWNER' });
    }

    // 8. MANA / RUNES
    const manaRegex = /(?:Ready|Refill|Gain|Channel) (\d+) (?:rune|mana|energy)/i;
    const manaMatch = text.match(manaRegex);
    if (manaMatch) {
        effects.push({ trigger: trigger || 'ON_CAST', action: 'GAIN_MANA', value: parseInt(manaMatch[1]), target: 'OWNER' });
    }

    // 9. KEYWORDS
    for (const kw of KEYWORDS) {
        if (text.includes(`Give it ${kw}`) || text.includes(`Grant it ${kw}`) || (text.includes(kw) && trigger)) {
            effects.push({ trigger: trigger || 'ON_CAST', action: 'GRANT_KEYWORD', keyword: kw, target: 'SELF' });
        }
    }

    if (effects.length > 0) {
        migratedCount++;
        return { ...card, effects };
    }

    skippedCount++;
    log(`[SKIP] ${card.type} ${card.id} (${card.name}): "${text}"`);
    return card;
}

log(`Starting Genesis Migration v3 on ${cards.length} cards...`);
const newCards = cards.map(c => processCard(c));
log(`Migration Complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newCards, null, 4));
fs.writeFileSync(LOG_PATH, auditLog.join('\n'));
log(`Written to ${OUTPUT_PATH}`);
