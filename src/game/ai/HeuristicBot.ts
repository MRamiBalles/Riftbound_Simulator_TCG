import { Action, PlayerId, SerializedGameState } from '../engine/game.types';
import { RuntimeCard } from '../engine/RuntimeCard';
import { Bot } from './BotInterface';

/**
 * A rule-based AI opponent that implements standard TCG heuristics.
 * Capable of keyword-aware trading, lethal detection, and turn management.
 */
export class HeuristicBot implements Bot {
    id: PlayerId;
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    fastMode: boolean;

    constructor(id: PlayerId = 'opponent', name: string = 'Noxian General', difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium', fastMode: boolean = false) {
        this.id = id;
        this.name = name;
        this.difficulty = difficulty;
        this.fastMode = fastMode;
    }

    /**
     * Entry point for the bot to decide its next action based on the current game state.
     * @param gameState - The current serialized state of the game.
     * @returns A promise resolving to an Action or null if no action is possible.
     */
    async decideAction(gameState: SerializedGameState): Promise<Action | null> {
        // Delay for realism
        if (!this.fastMode) {
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        if (gameState.priority !== this.id) {
            console.log(`[Bot] Priority mismatch. My ID: ${this.id}, Priority: ${gameState.priority}`);
            return null;
        }

        // 0. CHECK FOR LETHAL (If opponent HP <= total unblocked attack power)
        if (gameState.phase === 'Main' && gameState.activePlayer === this.id) {
            const lethalAction = this.checkLethalOpportunity(gameState);
            if (lethalAction) {
                console.log("[Bot] LETHAL DETECTED. Committing all units.");
                return lethalAction;
            }
        }

        // 1. COMBAT PHASE LOGIC
        if (gameState.phase === 'Combat') {
            if (gameState.combat?.step === 'declare_blockers' && gameState.activePlayer !== this.id) {
                return this.decideBlockers(gameState);
            }
        }

        // 2. MAIN PHASE LOGIC
        if (gameState.phase === 'Main') {
            if (gameState.activePlayer === this.id) {
                const attackAction = this.decideAttack(gameState);
                if (attackAction) return attackAction;
            }

            const playAction = this.decidePlayCard(gameState);
            if (playAction) return playAction;
        }

        // Default: End Turn
        console.log(`[Bot] No actions. Ending turn/passing.`);
        if (gameState.phase === 'Combat' && gameState.combat?.step === 'declare_blockers') {
            return { type: 'DECLARE_BLOCKERS', playerId: this.id, blockers: {} };
        }

        return { type: 'END_TURN', playerId: this.id };
    }

    /**
     * Evaluates the current board to see if attacking with all units can win the game.
     * @param gameState - The current state.
     * @returns A DECLARE_ATTACKERS action if lethal is detected, otherwise null.
     */
    private checkLethalOpportunity(gameState: SerializedGameState): Action | null {
        const myUnits = gameState.players[this.id].field;
        const opponentId: PlayerId = this.id === 'player' ? 'opponent' : 'player';
        const opponent = gameState.players[opponentId];
        const potentialAttackers = myUnits.filter((u: RuntimeCard) => !u.hasAttacked && !u.summoningSickness && !u.isStunned);

        const totalPower = potentialAttackers.reduce((sum: number, u: RuntimeCard) => sum + u.currentAttack, 0);

        // If we can kill opponent directly (assuming no blockers for a naive check,
        // or just being aggressive if they are low)
        if (totalPower >= opponent.health) {
            return {
                type: 'DECLARE_ATTACKERS',
                playerId: this.id,
                attackers: potentialAttackers.map((u: RuntimeCard) => u.instanceId)
            };
        }
        return null;
    }

    private decideAttack(gameState: SerializedGameState): Action | null {
        const myUnits = gameState.players[this.id].field;
        const opponentId: PlayerId = this.id === 'player' ? 'opponent' : 'player';
        const opponentField = gameState.players[opponentId].field;
        const potentialAttackers = myUnits.filter((u: RuntimeCard) => !u.hasAttacked && !u.summoningSickness && !u.isStunned);

        // Smart Attack: Units with Quick Attack, Barrier, or Lifesteal are prioritized
        const attackers = potentialAttackers.filter((u: RuntimeCard) => {
            const hasProtection = u.isBarrierActive || u.keywords.includes('Quick Attack');
            const hasLifesteal = u.keywords.includes('Lifesteal');
            const isTough = u.keywords.includes('Tough');

            const strongestOpponent = opponentField.length > 0 ? Math.max(...opponentField.map((o: RuntimeCard) => o.currentAttack)) : 0;

            // Attack if protected, or if we are stronger than their strongest unit,
            // or if we have lifesteal and need health, or if they have no board.
            const needHealth = gameState.players[this.id].health < 15;

            return hasProtection ||
                (hasLifesteal && needHealth) ||
                u.currentAttack > strongestOpponent ||
                isTough ||
                opponentField.length === 0;
        });

        if (attackers.length > 0) {
            return {
                type: 'DECLARE_ATTACKERS',
                playerId: this.id,
                attackers: attackers.map((u: RuntimeCard) => u.instanceId)
            };
        }
        return null;
    }

    private decideBlockers(gameState: SerializedGameState): Action | null {
        const myUnits = gameState.players[this.id].field;
        const attackingIds = Object.keys(gameState.combat?.attackers || {});
        const opponentId: PlayerId = this.id === 'player' ? 'opponent' : 'player';
        const opponentField = gameState.players[opponentId].field;

        const blockers: Record<string, string> = {};
        const availableBlockers = myUnits.filter((u: RuntimeCard) => !u.isStunned);

        attackingIds.forEach(attackerId => {
            const attacker = opponentField.find((u: RuntimeCard) => u.instanceId === attackerId);
            if (!attacker) return;

            // Try to find a profitable or safe block
            const bestBlocker = availableBlockers.find((b: RuntimeCard) => {
                const effectiveAttackerPower = Math.max(0, attacker.currentAttack - (b.keywords.includes('Tough') ? 1 : 0));
                const effectiveBlockerPower = Math.max(0, b.currentAttack - (attacker.keywords.includes('Tough') ? 1 : 0));

                const canKillAttacker = effectiveBlockerPower >= attacker.currentHealth;
                const willSurvive = b.isBarrierActive || b.currentHealth > effectiveAttackerPower;

                // Prioritize blocks where we survive or kill the attacker
                return canKillAttacker || willSurvive;
            }) || availableBlockers.find(b => {
                // If we can't find a "good" block, at least minimize nexus damage 
                // unless the attacker has Overwhelm and our blocker is too small
                return !attacker.keywords.includes('Overwhelm') || b.currentHealth >= attacker.currentAttack;
            });

            if (bestBlocker) {
                blockers[bestBlocker.instanceId] = attackerId;
                // Remove from available
                const index = availableBlockers.indexOf(bestBlocker);
                if (index > -1) availableBlockers.splice(index, 1);
            }
        });

        if (Object.keys(blockers).length > 0) {
            return {
                type: 'DECLARE_BLOCKERS',
                playerId: this.id,
                blockers
            };
        }
        return null;
    }

    private decidePlayCard(gameState: SerializedGameState): Action | null {
        const player = gameState.players[this.id];
        const playableCards = player.hand.filter((c: RuntimeCard) => c.currentCost <= player.mana);

        if (playableCards.length > 0) {
            // "Easy" bots sometimes play the cheapest card or skip
            if (this.difficulty === 'Easy' && Math.random() < 0.3) return null;

            playableCards.sort((a: RuntimeCard, b: RuntimeCard) => {
                const aValue = a.currentAttack + a.currentHealth + (a.rarity === 'Champion' ? 5 : 0);
                const bValue = b.currentAttack + b.currentHealth + (b.rarity === 'Champion' ? 5 : 0);
                return bValue - aValue;
            });

            const cardToPlay = playableCards[0];
            return {
                type: 'PLAY_CARD',
                playerId: this.id,
                cardId: cardToPlay.instanceId,
                targetId: 'player'
            };
        }
        return null;
    }
}
