import { RuntimeCard } from './RuntimeCard';
import { CombatState, PlayerId, SerializedGameState } from './game.types';

interface DamageEvent {
    sourceId: string;
    targetId: string;
    amount: number;
    isOverwhelm?: boolean;
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
     * 
     * @param state - The current serialized game state.
     * @param combat - The current active combat configuration.
     * @returns A result object containing damage events, death notifications, and nexus damage.
     */
    public static resolveCombat(
        state: SerializedGameState,
        combat: CombatState
    ): CombatResult {
        const result: CombatResult = {
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

        // Iterate through attackers
        Object.entries(combat.attackers).forEach(([attackerId, targetId]) => {
            const attacker = attackerField.find(c => c.instanceId === attackerId);
            if (!attacker) return;

            // Check if blocked
            const blockerId = Object.keys(combat.blockers).find(
                bId => combat.blockers[bId] === attackerId
            );
            const blocker = blockerId ? defenderField.find(c => c.instanceId === blockerId) : null;

            if (blocker) {
                // Unit Combat
                this.resolveUnitCombat(attacker, blocker, result, defenderId);
            } else {
                // Direct Hit
                this.resolveDirectHit(attacker, result, defenderId);
            }
        });

        return result;
    }

    /**
     * Resolves combat between a single attacker and its blocker.
     * Implements the logic for Barrier (negation), Quick Attack (strike order), 
     * Overwhelm (excess damage), and Lifesteal.
     */
    private static resolveUnitCombat(
        attacker: RuntimeCard,
        blocker: RuntimeCard,
        result: CombatResult,
        defenderId: PlayerId
    ) {
        const attackerId = attacker.ownerId as PlayerId;
        const blockerId = blocker.ownerId as PlayerId;

        const attackerDamage = this.calculateStrikingDamage(attacker);
        const blockerDamage = this.calculateStrikingDamage(blocker);

        // 1. ATTACKER STRIKES FIRST (Quick Attack Logic)
        let blockerDiedToQuickAttack = false;

        // Apply Attacker Damage to Blocker
        if (attackerDamage > 0) {
            if (blocker.isBarrierActive) {
                result.damageEvents.push({
                    sourceId: attacker.instanceId,
                    targetId: blocker.instanceId,
                    amount: 0, // Visual feedback of barrier pop
                });
                result.poppedBarriers.push(blocker.instanceId);
            } else {
                // Check for Tough (reduces dmg by 1)
                const finalDamage = blocker.keywords.includes('Tough') ? Math.max(0, attackerDamage - 1) : attackerDamage;

                result.damageEvents.push({
                    sourceId: attacker.instanceId,
                    targetId: blocker.instanceId,
                    amount: finalDamage
                });

                // Lifesteal
                if (attacker.keywords.includes('Lifesteal')) {
                    result.lifestealHeal[attackerId] += finalDamage;
                }

                if (blocker.currentHealth <= finalDamage) {
                    blockerDiedToQuickAttack = true;
                    result.deadUnits.push(blocker.instanceId);

                    // Overwhelm Logic
                    if (attacker.keywords.includes('Overwhelm')) {
                        const excess = attackerDamage - blocker.currentHealth;
                        if (excess > 0) {
                            result.nexusDamage[defenderId] += excess;
                            result.damageEvents.push({
                                sourceId: attacker.instanceId,
                                targetId: defenderId,
                                amount: excess,
                                isOverwhelm: true
                            });
                            // Overwhelm also triggers Lifesteal
                            if (attacker.keywords.includes('Lifesteal')) {
                                result.lifestealHeal[attackerId] += excess;
                            }
                        }
                    }
                }
            }
        }

        // 2. BLOCKER STRIKES BACK
        // Only strikes if it didn't die to a Quick Attack (and attacker doesn't have Quick Attack)
        // Note: Quick Attack only applies when ATTACKING.
        const canBlockerStrike = !blockerDiedToQuickAttack && blockerDamage > 0;

        if (canBlockerStrike) {
            if (attacker.isBarrierActive) {
                result.damageEvents.push({
                    sourceId: blocker.instanceId,
                    targetId: attacker.instanceId,
                    amount: 0,
                });
                result.poppedBarriers.push(attacker.instanceId);
            } else {
                const finalDamage = attacker.keywords.includes('Tough') ? Math.max(0, blockerDamage - 1) : blockerDamage;

                result.damageEvents.push({
                    sourceId: blocker.instanceId,
                    targetId: attacker.instanceId,
                    amount: finalDamage
                });

                // Lifesteal
                if (blocker.keywords.includes('Lifesteal')) {
                    result.lifestealHeal[blockerId] += finalDamage;
                }

                if (attacker.currentHealth <= finalDamage) {
                    result.deadUnits.push(attacker.instanceId);
                }
            }
        }
    }

    private static resolveDirectHit(
        attacker: RuntimeCard,
        result: CombatResult,
        defenderId: PlayerId
    ) {
        const damage = this.calculateStrikingDamage(attacker);
        const attackerId = attacker.ownerId as PlayerId;

        result.nexusDamage[defenderId] += damage;
        result.damageEvents.push({
            sourceId: attacker.instanceId,
            targetId: defenderId,
            amount: damage
        });

        // Lifesteal on face
        if (attacker.keywords.includes('Lifesteal')) {
            result.lifestealHeal[attackerId] += damage;
        }
    }

    private static calculateStrikingDamage(card: RuntimeCard): number {
        return Math.max(0, card.currentAttack);
    }
}
