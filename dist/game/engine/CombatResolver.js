"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatResolver = void 0;
class CombatResolver {
    static resolveCombat(state, combat) {
        const globalResult = {
            damageEvents: [],
            deadUnits: [],
            poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 },
            lifestealHeal: { player: 0, opponent: 0 }
        };
        const activePlayerId = state.activePlayer;
        const defenderId = activePlayerId === 'player' ? 'opponent' : 'player';
        const attackerField = state.players[activePlayerId].field;
        const defenderField = state.players[defenderId].field;
        Object.entries(combat.attackers).forEach(([attackerId, targetId]) => {
            const attacker = attackerField.find(c => c.instanceId === attackerId);
            if (!attacker)
                return;
            const blockerId = Object.keys(combat.blockers).find(bId => combat.blockers[bId] === attackerId);
            const blocker = blockerId ? defenderField.find(c => c.instanceId === blockerId) : null;
            let result;
            if (blocker) {
                const isQuickAttack = attacker.keywords.includes('Quick Attack');
                result = this.resolveUnitCombat(attacker, blocker, isQuickAttack);
            }
            else {
                result = this.resolveDirectHit(attacker);
            }
            // Merge
            globalResult.damageEvents.push(...result.damageEvents);
            globalResult.deadUnits.push(...result.deadUnits);
            globalResult.poppedBarriers.push(...result.poppedBarriers);
            globalResult.nexusDamage.player += result.nexusDamage.player;
            globalResult.nexusDamage.opponent += result.nexusDamage.opponent;
            globalResult.lifestealHeal.player += result.lifestealHeal.player;
            globalResult.lifestealHeal.opponent += result.lifestealHeal.opponent;
        });
        return globalResult;
    }
    static resolveUnitCombat(attacker, blocker, isQuickAttack = false) {
        const result = {
            damageEvents: [], deadUnits: [], poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 }, lifestealHeal: { player: 0, opponent: 0 }
        };
        const attackerId = attacker.ownerId;
        const blockerId = blocker.ownerId;
        const defenderId = attackerId === 'player' ? 'opponent' : 'player';
        const atkDmg = this.calculateStrikingDamage(attacker);
        const blkDmg = this.calculateStrikingDamage(blocker);
        const applyStrike = (striker, target, dmg, sId, tId) => {
            // Simultaneous combat support: Do not check deadUnits here.
            // Quick Attack logic handles the check continuously in the proper scope.
            const targetPreHP = target.currentHealth;
            let actualDmgToUnit = dmg;
            // Overwhelm Logic: Calculate excess first to split damage
            let excess = 0;
            if (striker === attacker && striker.keywords.includes('Overwhelm')) {
                excess = Math.max(0, dmg - targetPreHP);
                if (excess > 0) {
                    actualDmgToUnit = Math.max(0, dmg - excess);
                }
            }
            if (target.isBarrierActive || target.keywords.includes('Barrier')) {
                result.poppedBarriers.push(target.instanceId);
                result.damageEvents.push({ sourceId: striker.instanceId, targetId: target.instanceId, amount: 0, isCombat: true });
                target.isBarrierActive = false;
                actualDmgToUnit = 0;
            }
            else {
                if (target.keywords.includes('Tough'))
                    actualDmgToUnit = Math.max(0, actualDmgToUnit - 1);
                target.currentHealth -= actualDmgToUnit;
                result.damageEvents.push({ sourceId: striker.instanceId, targetId: target.instanceId, amount: actualDmgToUnit, isCombat: true });
            }
            if (striker.keywords.includes('Lifesteal')) {
                // Lifesteal heals for the amount of damage ACTUALLY dealt to Unit
                result.lifestealHeal[sId] += actualDmgToUnit;
            }
            if (excess > 0) {
                result.nexusDamage[defenderId] += excess;
                result.damageEvents.push({ sourceId: striker.instanceId, targetId: defenderId, amount: excess, isOverwhelm: true });
                // If Lifesteal, we also heal for the excess damage dealt to Nexus
                if (striker.keywords.includes('Lifesteal')) {
                    result.lifestealHeal[sId] += excess;
                }
            }
            if (target.currentHealth <= 0)
                result.deadUnits.push(target.instanceId);
        };
        if (isQuickAttack) {
            applyStrike(attacker, blocker, atkDmg, attackerId, blockerId);
            if (!result.deadUnits.includes(blocker.instanceId)) {
                applyStrike(blocker, attacker, blkDmg, blockerId, attackerId);
            }
        }
        else {
            applyStrike(attacker, blocker, atkDmg, attackerId, blockerId);
            applyStrike(blocker, attacker, blkDmg, blockerId, attackerId);
        }
        return result;
    }
    static resolveDirectHit(attacker) {
        const result = {
            damageEvents: [], deadUnits: [], poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 }, lifestealHeal: { player: 0, opponent: 0 }
        };
        const dmg = this.calculateStrikingDamage(attacker);
        const sId = attacker.ownerId;
        const dId = sId === 'player' ? 'opponent' : 'player';
        result.nexusDamage[dId] += dmg;
        result.damageEvents.push({ sourceId: attacker.instanceId, targetId: dId, amount: dmg });
        if (attacker.keywords.includes('Lifesteal'))
            result.lifestealHeal[sId] += dmg;
        return result;
    }
    static calculateStrikingDamage(card) {
        return Math.max(0, card.currentAttack);
    }
}
exports.CombatResolver = CombatResolver;
