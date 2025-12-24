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
        // Attacker strikes Blocker
        const attackDamage = this.calculateStrikingDamage(attacker);
        const blockDamage = this.calculateStrikingDamage(blocker);

        // Barrier checks logic could go here

        // Attacker deals damage to Blocker
        result.damageEvents.push({
            sourceId: attacker.instanceId,
            targetId: blocker.instanceId,
            amount: attackDamage
        });

        // Blocker strikes back (unless attacker has Quick Attack and kills blocker first - simplified for now simultaneous)
        result.damageEvents.push({
            sourceId: blocker.instanceId,
            targetId: attacker.instanceId,
            amount: blockDamage
        });

        // Check death (logic should be handled by engine applying these events, but we can predict)
        if (blocker.currentHealth <= attackDamage) {
            result.deadUnits.push(blocker.instanceId);

            // Overwhelm Check
            if (attacker.keywords.includes('Overwhelm')) {
                const excess = attackDamage - blocker.currentHealth;
                if (excess > 0) {
                    result.nexusDamage[defenderId] += excess;
                    result.damageEvents.push({
                        sourceId: attacker.instanceId,
                        targetId: defenderId, // Special ID for nexus
                        amount: excess,
                        isOverwhelm: true
                    });
                }
            }
        }

        if (attacker.currentHealth <= blockDamage) {
            result.deadUnits.push(attacker.instanceId);
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
