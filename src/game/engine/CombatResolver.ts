import { RuntimeCard } from './RuntimeCard';
import { CombatState, PlayerId, SerializedGameState } from './game.types';

interface DamageEvent {
    sourceId: string;
    targetId: string;
    amount: number;
    isOverwhelm?: boolean;
    isCombat?: boolean;
}

export interface CombatResult {
    damageEvents: DamageEvent[];
    deadUnits: string[]; // IDs of units that died
    poppedBarriers: string[]; // IDs of units whose barrier was consumed
    nexusDamage: Record<PlayerId, number>; // Damage to players
    lifestealHeal: Record<PlayerId, number>; // Healing from lifesteal
}

/**
 * Utility for resolving combat interactions between units and the Nexus.
 * Handles keyword mechanics such as Barrier, Quick Attack, Overwhelm, and Lifesteal.
 */
export class CombatResolver {
    /**
     * Resolves an entire combat state, iterating through all declared attackers
     * and matching them against blockers to determine damage distribution.
     */
    public static resolveCombat(
        state: SerializedGameState,
        combat: CombatState
    ): CombatResult {
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

            const blockerId = Object.keys(combat.blockers).find(
                bId => combat.blockers[bId] === attackerId
            );
            const blocker = blockerId ? defenderField.find(c => c.instanceId === blockerId) : null;

            let interactionResult: CombatResult;
            if (blocker) {
                const isQuickAttack = attacker.keywords.includes('Quick Attack' as any);
                interactionResult = this.resolveUnitCombat(attacker, blocker, isQuickAttack);
            } else {
                interactionResult = this.resolveDirectHit(attacker);
            }

            // Merge results
            globalResult.damageEvents.push(...interactionResult.damageEvents);
            globalResult.deadUnits.push(...interactionResult.deadUnits);
            globalResult.poppedBarriers.push(...interactionResult.poppedBarriers);
            globalResult.nexusDamage.player += interactionResult.nexusDamage.player;
            globalResult.nexusDamage.opponent += interactionResult.nexusDamage.opponent;
            globalResult.lifestealHeal.player += interactionResult.lifestealHeal.player;
            globalResult.lifestealHeal.opponent += interactionResult.lifestealHeal.opponent;
        });

        return globalResult;
    }

    public static resolveUnitCombat(
        attacker: RuntimeCard,
        blocker: RuntimeCard,
        isQuickAttack: boolean = false,
        isChallenger: boolean = false
    ): CombatResult {
        const result: CombatResult = {
            damageEvents: [],
            deadUnits: [],
            poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 },
            lifestealHeal: { player: 0, opponent: 0 }
        };

        const attackerId = attacker.ownerId as PlayerId;
        const blockerId = blocker.ownerId as PlayerId;
        const defenderId = attackerId === 'player' ? 'opponent' : 'player';

        const attackerDamage = this.calculateStrikingDamage(attacker);
        const blockerDamage = this.calculateStrikingDamage(blocker);

        const unitsStruck: Set<string> = new Set();

        const applyStrike = (striker: RuntimeCard, target: RuntimeCard, damage: number, sOwner: PlayerId, tOwner: PlayerId) => {
            if (unitsStruck.has(striker.instanceId) || result.deadUnits.includes(striker.instanceId)) return;
            if (result.deadUnits.includes(target.instanceId) && !striker.keywords.includes('Overwhelm' as any)) return;

            unitsStruck.add(striker.instanceId);
            const targetPreHealth = target.currentHealth;

            // Barrier
            if (target.isBarrierActive || target.keywords.includes('Barrier' as any)) {
                result.poppedBarriers.push(target.instanceId);
                result.damageEvents.push({ sourceId: striker.instanceId, targetId: target.instanceId, amount: 0, isCombat: true });
                target.isBarrierActive = false;
                return;
            }

            // Tough / Damage
            let actualDamage = damage;
            if (target.keywords.includes('Tough' as any)) actualDamage = Math.max(0, actualDamage - 1);

            target.currentHealth -= actualDamage;
            result.damageEvents.push({ sourceId: striker.instanceId, targetId: target.instanceId, amount: actualDamage, isCombat: true });

            if (striker.keywords.includes('Lifesteal' as any)) result.lifestealHeal[sOwner] += actualDamage;

            // Overwhelm
            if (striker === attacker && striker.keywords.includes('Overwhelm' as any)) {
                const excess = Math.max(0, actualDamage - targetPreHealth);
                if (excess > 0) {
                    result.nexusDamage[defenderId] += excess;
                    result.damageEvents.push({ sourceId: striker.instanceId, targetId: defenderId, amount: excess, isOverwhelm: true });
                    if (striker.keywords.includes('Lifesteal' as any)) result.lifestealHeal[sOwner] += excess;
                }
            }

            if (target.currentHealth <= 0) result.deadUnits.push(target.instanceId);
        };

        if (isQuickAttack) {
            applyStrike(attacker, blocker, attackerDamage, attackerId, blockerId);
            if (!result.deadUnits.includes(blocker.instanceId)) {
                applyStrike(blocker, attacker, blockerDamage, blockerId, attackerId);
            }
        } else {
            // Simultaneous strike
            applyStrike(attacker, blocker, attackerDamage, attackerId, blockerId);
            applyStrike(blocker, attacker, blockerDamage, blockerId, attackerId);
        }

        return result;
    }

    public static resolveDirectHit(attacker: RuntimeCard): CombatResult {
        const result: CombatResult = {
            damageEvents: [],
            deadUnits: [],
            poppedBarriers: [],
            nexusDamage: { player: 0, opponent: 0 },
            lifestealHeal: { player: 0, opponent: 0 }
        };

        const damage = this.calculateStrikingDamage(attacker);
        const attackerId = attacker.ownerId as PlayerId;
        const defenderId = attackerId === 'player' ? 'opponent' : 'player';

        result.nexusDamage[defenderId] += damage;
        result.damageEvents.push({
            sourceId: attacker.instanceId,
            targetId: defenderId,
            amount: damage
        });

        if (attacker.keywords.includes('Lifesteal' as any)) {
            result.lifestealHeal[attackerId] += damage;
        }

        return result;
    }
}

    private static calculateStrikingDamage(card: RuntimeCard): number {
    return Math.max(0, card.currentAttack);
}
}
