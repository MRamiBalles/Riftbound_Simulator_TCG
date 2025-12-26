import { RuntimeCard } from './RuntimeCard';
import { CombatState, PlayerId, SerializedGameState } from './game.types';

interface DamageEvent {
    sourceId: string;
    targetId: string;
    amount: number;
    isOverwhelm?: boolean;
}

interface CombatResult {
    damageEvents: DamageEvent[];
    deadUnits: string[]; // IDs of units that died
    nexusDamage: Record<PlayerId, number>; // Damage to players
}

export class CombatResolver {
    public static resolveCombat(
        state: SerializedGameState,
        combat: CombatState
    ): CombatResult {
        const result: CombatResult = {
            damageEvents: [],
            deadUnits: [],
            nexusDamage: { player: 0, opponent: 0 }
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
                // Direct Hit (unless Ghost blocker etc, kept simple for MVP)
                this.resolveDirectHit(attacker, result, defenderId);
            }
        });

        return result;
    }

    private static resolveUnitCombat(
        attacker: RuntimeCard,
        blocker: RuntimeCard,
        result: CombatResult,
        defenderId: PlayerId
    ) {
        const attackerId = attacker.ownerId as PlayerId;
        const attackerHasQuickAttack = attacker.keywords.includes('Quick Attack');
        const attackerDamage = this.calculateStrikingDamage(attacker);
        const blockerDamage = this.calculateStrikingDamage(blocker);

        // 1. ATTACKER STRIKES FIRST (Quick Attack Logic)
        let blockerDiedToQuickAttack = false;

        // Apply Attacker Damage to Blocker
        const actualAttackDamage = blocker.isBarrierActive ? 0 : attackerDamage;
        if (blocker.isBarrierActive && attackerDamage > 0) {
            result.damageEvents.push({
                sourceId: attacker.instanceId,
                targetId: blocker.instanceId,
                amount: 0, // Visual feedback of barrier pop
            });
            // Note: In a real engine, we'd clear the barrier flag here.
            // For the resolver, we just don't deal damage.
        } else if (attackerDamage > 0) {
            result.damageEvents.push({
                sourceId: attacker.instanceId,
                targetId: blocker.instanceId,
                amount: attackerDamage
            });
            if (blocker.currentHealth <= attackerDamage) {
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
                    }
                }
            }
        }

        // 2. BLOCKER STRIKES BACK
        // Only strikes if it didn't die to a Quick Attack and it has attack power
        const canBlockerStrike = !blockerDiedToQuickAttack && blockerDamage > 0;

        if (canBlockerStrike) {
            const actualBlockDamage = attacker.isBarrierActive ? 0 : blockerDamage;

            result.damageEvents.push({
                sourceId: blocker.instanceId,
                targetId: attacker.instanceId,
                amount: actualBlockDamage
            });

            if (!attacker.isBarrierActive && attacker.currentHealth <= blockerDamage) {
                result.deadUnits.push(attacker.instanceId);
            }
        }
    }

    private static resolveDirectHit(
        attacker: RuntimeCard,
        result: CombatResult,
        defenderId: PlayerId
    ) {
        const damage = this.calculateStrikingDamage(attacker);
        result.nexusDamage[defenderId] += damage;
        result.damageEvents.push({
            sourceId: attacker.instanceId,
            targetId: defenderId,
            amount: damage
        });
    }

    private static calculateStrikingDamage(card: RuntimeCard): number {
        // Here we could check for 'Weak' or other debuffs
        return Math.max(0, card.currentAttack);
    }
}
