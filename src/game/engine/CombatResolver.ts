import { RuntimeCard } from './RuntimeCard';
import { CombatState, PlayerId, SerializedGameState } from './game.types';

export interface DamageEvent {
    sourceId: string;
    targetId: string;
    amount: number;
    isOverwhelm?: boolean;
    isCombat?: boolean;
}

export interface CombatResult {
    damageEvents: DamageEvent[];
    deadUnits: string[];
    poppedBarriers: string[];
    nexusDamage: Record<PlayerId, number>;
    lifestealHeal: Record<PlayerId, number>;
}

export class CombatResolver {
    public static resolveCombat(state: SerializedGameState, combat: CombatState): CombatResult {
        const globalResult: CombatResult = {
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
            if (!attacker) return;

            const blockerId = Object.keys(combat.blockers).find(bId => combat.blockers[bId] === attackerId);
            const blocker = blockerId ? defenderField.find(c => c.instanceId === blockerId) : null;

            let result: CombatResult;
            if (blocker) {
                const isQuickAttack = attacker.keywords.includes('Quick Attack' as any);
                result = this.resolveUnitCombat(attacker, blocker, isQuickAttack);
            } else {
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

    public static resolveUnitCombat(
        attacker: RuntimeCard,
        blocker: RuntimeCard,
        isQuickAttack: boolean = false
    ): CombatResult {
        const result: CombatResult = {
            damageEvents: [], deadUnits: [], poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 }, lifestealHeal: { player: 0, opponent: 0 }
        };

        const attackerId = attacker.ownerId as PlayerId;
        const blockerId = blocker.ownerId as PlayerId;
        const defenderId = attackerId === 'player' ? 'opponent' : 'player';

        const atkDmg = this.calculateStrikingDamage(attacker);
        const blkDmg = this.calculateStrikingDamage(blocker);

        const applyStrike = (striker: RuntimeCard, target: RuntimeCard, dmg: number, sId: PlayerId, tId: PlayerId) => {
            if (result.deadUnits.includes(striker.instanceId)) return;
            const targetPreHP = target.currentHealth;
            let actualDmgToUnit = dmg;

            if (target.isBarrierActive || target.keywords.includes('Barrier' as any)) {
                result.poppedBarriers.push(target.instanceId);
                result.damageEvents.push({ sourceId: striker.instanceId, targetId: target.instanceId, amount: 0, isCombat: true });
                target.isBarrierActive = false;
                actualDmgToUnit = 0; // The unit takes 0, but we still calculate Overwhelm below
            } else {
                if (target.keywords.includes('Tough' as any)) actualDmgToUnit = Math.max(0, actualDmgToUnit - 1);
                target.currentHealth -= actualDmgToUnit;
                result.damageEvents.push({ sourceId: striker.instanceId, targetId: target.instanceId, amount: actualDmgToUnit, isCombat: true });
            }

            if (striker.keywords.includes('Lifesteal' as any)) {
                // Lifesteal heals for the amount of damage that WOULD have been dealt (atk power)
                // In Riftbound/LoR, Lifesteal hits for the unit's power regardless of barrier.
                result.lifestealHeal[sId] += dmg;
            }

            if (striker === attacker && striker.keywords.includes('Overwhelm' as any)) {
                // Overwhelm calculates based on what SHOULD HAVE been dealt vs current HP
                const excess = Math.max(0, dmg - targetPreHP);
                if (excess > 0) {
                    result.nexusDamage[defenderId] += excess;
                    result.damageEvents.push({ sourceId: striker.instanceId, targetId: defenderId, amount: excess, isOverwhelm: true });
                    // Lifesteal on excess is handled by the initial 'dmg' addition above if it counts total striking power,
                    // but usually it's power + excess? No, power is the total.
                }
            }

            if (target.currentHealth <= 0) result.deadUnits.push(target.instanceId);
        };

        if (isQuickAttack) {
            applyStrike(attacker, blocker, atkDmg, attackerId, blockerId);
            if (!result.deadUnits.includes(blocker.instanceId)) {
                applyStrike(blocker, attacker, blkDmg, blockerId, attackerId);
            }
        } else {
            applyStrike(attacker, blocker, atkDmg, attackerId, blockerId);
            applyStrike(blocker, attacker, blkDmg, blockerId, attackerId);
        }

        return result;
    }

    public static resolveDirectHit(attacker: RuntimeCard): CombatResult {
        const result: CombatResult = {
            damageEvents: [], deadUnits: [], poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 }, lifestealHeal: { player: 0, opponent: 0 }
        };

        const dmg = this.calculateStrikingDamage(attacker);
        const sId = attacker.ownerId as PlayerId;
        const dId = sId === 'player' ? 'opponent' : 'player';

        result.nexusDamage[dId] += dmg;
        result.damageEvents.push({ sourceId: attacker.instanceId, targetId: dId, amount: dmg });
        if (attacker.keywords.includes('Lifesteal' as any)) result.lifestealHeal[sId] += dmg;

        return result;
    }

    private static calculateStrikingDamage(card: RuntimeCard): number {
        return Math.max(0, card.currentAttack);
    }
}
