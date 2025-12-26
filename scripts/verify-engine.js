const { CoreEngine } = require('../src/game/engine/CoreEngine');
const { CombatResolver } = require('../src/game/engine/CombatResolver');
const { createRuntimeCard } = require('../src/game/engine/RuntimeCard');

// Mock Card Data
const card_quick_attack = { id: 'QA', name: 'QA Unit', attack: 3, health: 3, type: 'Unit', keywords: ['Quick Attack'] };
const card_normal = { id: 'NORM', name: 'Normal Unit', attack: 3, health: 3, type: 'Unit', keywords: [] };
const card_barrier = { id: 'BARR', name: 'Barrier Unit', attack: 1, health: 1, type: 'Unit', keywords: ['Barrier'] };
const card_overwhelm = { id: 'OVW', name: 'Overwhelm Unit', attack: 5, health: 1, type: 'Unit', keywords: ['Overwhelm'] };

function runTests() {
    console.log('--- STARTING ENGINE VERIFICATION ---\n');

    // 1. Test Quick Attack
    console.log('Test 1: Quick Attack kills defender before it strikes back');
    const qa_attacker = createRuntimeCard(card_quick_attack, 'player');
    const norm_defender = createRuntimeCard(card_normal, 'opponent');

    // We mock the combat resolver logic since we are running in Node (no crypto.randomUUID fallback in old node, but usually fine in modern)
    const result = CombatResolver.resolveUnitCombat(qa_attacker, norm_defender, { damageEvents: [], deadUnits: [], nexusDamage: { player: 0, opponent: 0 } }, 'opponent');

    const defenderDied = result.deadUnits.includes(norm_defender.instanceId);
    const attackerTookDamage = result.damageEvents.some(e => e.targetId === qa_attacker.instanceId);

    console.log(`- Defender died: ${defenderDied} (Expected: true)`);
    console.log(`- Attacker took damage: ${attackerTookDamage} (Expected: false)`);
    console.log(defenderDied && !attackerTookDamage ? '✅ PASSED' : '❌ FAILED');

    // 2. Test Barrier
    console.log('\nTest 2: Barrier blocks damage');
    const barr_defender = createRuntimeCard(card_barrier, 'opponent');
    const norm_attacker = createRuntimeCard(card_normal, 'player');

    const result2 = CombatResolver.resolveUnitCombat(norm_attacker, barr_defender, { damageEvents: [], deadUnits: [], nexusDamage: { player: 0, opponent: 0 } }, 'opponent');
    const damageToBarrier = result2.damageEvents.find(e => e.targetId === barr_defender.instanceId)?.amount;

    console.log(`- Damage to barrier: ${damageToBarrier} (Expected: 0)`);
    console.log(damageToBarrier === 0 ? '✅ PASSED' : '❌ FAILED');

    // 3. Test Overwhelm
    console.log('\nTest 3: Overwhelm deals excess to Nexus');
    const ovw_attacker = createRuntimeCard(card_overwhelm, 'player');
    const weak_defender = createRuntimeCard(card_barrier, 'opponent'); // 1 HP
    weak_defender.isBarrierActive = false; // Pop it for test

    const result3 = CombatResolver.resolveUnitCombat(ovw_attacker, weak_defender, { damageEvents: [], deadUnits: [], nexusDamage: { player: 0, opponent: 0 } }, 'opponent');
    const nexusDamage = result3.nexusDamage.opponent;

    console.log(`- Nexus Damage: ${nexusDamage} (Expected: 4)`);
    console.log(nexusDamage === 4 ? '✅ PASSED' : '❌ FAILED');

    console.log('\n--- VERIFICATION COMPLETE ---');
}

runTests();
