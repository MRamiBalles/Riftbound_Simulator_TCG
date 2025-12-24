import { Bot } from './BotInterface';
import { Action, SerializedGameState } from '../engine/game.types';

export class HeuristicBot implements Bot {
    id: string;
    name: string;

    constructor(id: string = 'opponent', name: string = 'Noxian General') {
        this.id = id;
        this.name = name;
    }

    async decideAction(gameState: SerializedGameState): Promise<Action | null> {
        // Delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        if (gameState.priority !== this.id) {
            console.log(`[Bot] Priority mismatch. My ID: ${this.id}, Priority: ${gameState.priority}`);
            return null;
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
        // If it's combat declare blockers step but no blocks, we send empty blocks
        if (gameState.phase === 'Combat' && gameState.combat?.step === 'declare_blockers') {
            return { type: 'DECLARE_BLOCKERS', playerId: this.id as any, blockers: {} };
        }

        return { type: 'END_TURN', playerId: this.id as any };
    }

    private decideAttack(gameState: SerializedGameState): Action | null {
        const myUnits = gameState.players[this.id as any].field;
        const potentialAttackers = myUnits.filter(u => !u.hasAttacked && !u.summoningSickness);

        if (potentialAttackers.length > 0) {
            return {
                type: 'DECLARE_ATTACKERS',
                playerId: this.id as any,
                attackers: potentialAttackers.map(u => u.instanceId)
            };
        }
        return null;
    }

    private decideBlockers(gameState: SerializedGameState): Action | null {
        const myUnits = gameState.players[this.id as any].field;
        const attackers = Object.keys(gameState.combat?.attackers || {});
        const blockers: Record<string, string> = {};
        let availableBlockers = [...myUnits];

        attackers.forEach(attackerId => {
            if (availableBlockers.length > 0) {
                const blocker = availableBlockers.pop();
                if (blocker) {
                    blockers[blocker.instanceId] = attackerId;
                }
            }
        });

        if (Object.keys(blockers).length > 0) {
            return {
                type: 'DECLARE_BLOCKERS',
                playerId: this.id as any,
                blockers
            };
        }
        // Pass empty blocks handled by default fallthrough if we want, but explicit here is fine
        return null;
    }

    private decidePlayCard(gameState: SerializedGameState): Action | null {
        const player = gameState.players[this.id as any];
        const playableCards = player.hand.filter(c => c.currentCost <= player.mana);

        if (playableCards.length > 0) {
            playableCards.sort((a, b) => b.currentCost - a.currentCost);
            const cardToPlay = playableCards[0];
            return {
                type: 'PLAY_CARD',
                playerId: this.id as any,
                cardId: cardToPlay.instanceId,
                targetId: 'player'
            };
        }
        return null;
    }
}
