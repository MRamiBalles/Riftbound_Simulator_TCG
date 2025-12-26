import { Card } from '@/lib/database.types';
import {
    Action,
    CombatState,
    PlayerId,
    SerializedGameState,
    SerializedPlayerState,
    Phase,
    ReplayData
} from './game.types';
import { createRuntimeCard, RuntimeCard } from './RuntimeCard';
import { CombatResolver } from './CombatResolver';

/**
 * The core deterministic game engine for Riftbound Simulator.
 * Manages game state, turn flow, mana logic, and action resolution.
 * Designed for full serializability to support AI training and state syncing.
 */
export class CoreEngine {
    private state: SerializedGameState;

    private initialState: { p1Deck: Card[], p2Deck: Card[] } | null = null;

    constructor(initialState?: SerializedGameState) {
        if (initialState) {
            this.state = JSON.parse(JSON.stringify(initialState));
            if (!this.state.actionHistory) this.state.actionHistory = [];
        } else {
            this.state = this.createInitialState();
        }
    }

    // --- INITIALIZATION ---

    /**
     * Initializes a new game session with provided decks.
     * Shuffles decks, draws initial hands, and sets the starting turn.
     * 
     * @param playerDeck - Array of cards for the human player.
     * @param opponentDeck - Array of cards for the AI opponent.
     */
    public initGame(playerDeck: Card[], opponentDeck: Card[]) {
        this.initialState = { p1Deck: [...playerDeck], p2Deck: [...opponentDeck] };
        this.state = this.createInitialState();
        this.state.actionHistory = [];

        // Initialize Players
        this.initializePlayer('player', playerDeck);
        this.initializePlayer('opponent', opponentDeck);

        // Start Game
        this.state.log.push('Game Initialized');
        this.drawInitialHands();
        this.state.phase = 'Mulligan';
    }

    /**
     * Resets the game to its starting point with the same decks.
     */
    public resetGame() {
        if (this.initialState) {
            this.initGame(this.initialState.p1Deck, this.initialState.p2Deck);
        }
    }

    private createInitialState(): SerializedGameState {
        return {
            turn: 0,
            activePlayer: 'player', // Coin toss could go here
            priority: 'player',
            phase: 'Main', // Will be reset on startTurn
            players: {
                player: this.createEmptyPlayerState('player'),
                opponent: this.createEmptyPlayerState('opponent'),
            },
            winner: null,
            log: [],
            combat: null,
            stack: [],
            actionHistory: []
        };
    }

    private createEmptyPlayerState(id: PlayerId): SerializedPlayerState {
        return {
            id,
            health: 20,
            maxHealth: 20,
            mana: 0,
            maxMana: 0,
            hand: [],
            deckCount: 0, // Virtual count
            field: [],
            graveyard: []
        };
    }

    private initializePlayer(id: PlayerId, deck: Card[]) {
        // Shuffle deck
        const shuffled = [...deck].sort(() => Math.random() - 0.5);
        const runtimeDeck = shuffled.map(c => createRuntimeCard(c, id));
        this.decks[id] = runtimeDeck;
        this.state.players[id].deckCount = runtimeDeck.length;
    }

    private decks: Record<PlayerId, RuntimeCard[]> = { player: [], opponent: [] };

    private drawInitialHands() {
        for (let i = 0; i < 4; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }
    }

    // --- ACTIONS ---

    /**
     * Applies a player action to the current state and returns the resulting state.
     * Dispatches to internal handlers based on the ActionType.
     * 
     * @param action - The action to perform (e.g., PLAY_CARD, END_TURN).
     * @returns The updated SerializedGameState.
     */
    public applyAction(action: Action): SerializedGameState {
        if (this.state.winner) return this.state;

        // Record for replay
        if (!this.state.actionHistory) this.state.actionHistory = [];
        this.state.actionHistory.push({ ...action });

        this.state.log.push(`[${action.playerId}] ${action.type}`);

        switch (action.type) {
            case 'PLAY_CARD':
                this.handlePlayCard(action);
                break;
            case 'ATTACK_UNIT':
                break;
            case 'DECLARE_ATTACKERS':
                this.handleDeclareAttackers(action);
                break;
            case 'DECLARE_BLOCKERS':
                this.handleDeclareBlockers(action);
                break;
            case 'RESOLVE_COMBAT':
                this.handleResolveCombat();
                break;
            case 'END_TURN':
                this.handleEndTurn();
                break;
            case 'SELECT_MULLIGAN':
                this.handleMulligan(action);
                break;
            case 'PASS':
                this.handlePass(action.playerId);
                break;
        }

        return this.getState();
    }

    public getState(): SerializedGameState {
        return JSON.parse(JSON.stringify(this.state));
    }

    // --- GAME LOGIC ---

    private handleMulligan(action: Action) {
        if (this.state.phase !== 'Mulligan') return;

        const playerId = action.playerId;
        const player = this.state.players[playerId];
        const swapIds = action.mulliganCards || [];

        if (swapIds.length > 0) {
            this.state.log.push(`[${playerId}] Replacing ${swapIds.length} cards in Mulligan`);

            const cardsToSwap: RuntimeCard[] = [];

            // Remove from hand
            swapIds.forEach(id => {
                const idx = player.hand.findIndex(c => c.instanceId === id);
                if (idx !== -1) {
                    cardsToSwap.push(player.hand.splice(idx, 1)[0]);
                }
            });

            // Draw new ones
            for (let i = 0; i < cardsToSwap.length; i++) {
                this.drawCard(playerId);
            }

            // Shuffle old ones back
            const deck = this.decks[playerId];
            deck.push(...cardsToSwap);
            deck.sort(() => Math.random() - 0.5);
            player.deckCount = deck.length;
        }

        // track which players have mulliganed
        this.mulliganStatus[playerId] = true;

        // Simple AI Mulligan (AI never swaps for now, but mark it done)
        if (playerId === 'player') {
            this.mulliganStatus['opponent'] = true;
        }

        if (this.mulliganStatus.player && this.mulliganStatus.opponent) {
            this.state.log.push(`Mulligan Phase Complete`);
            this.startTurn();
        }
    }

    private mulliganStatus: Record<PlayerId, boolean> = { player: false, opponent: false };

    private startTurn() {
        this.state.turn++;
        const active = this.state.activePlayer;
        this.state.priority = active;

        // 1. Mana Logic
        const player = this.state.players[active];
        player.maxMana = Math.min(10, player.maxMana + 1);
        player.mana = player.maxMana;

        // 2. Regeneration Logic (at start of turn)
        player.field.forEach(u => {
            if (u.keywords.includes('Regeneration')) {
                u.currentHealth = u.maxHealth;
            }
        });

        this.state.phase = 'Draw';
        this.drawCard(active);

        this.state.phase = 'Main';

        // 3. Reset unit states
        player.field.forEach(u => {
            u.hasAttacked = false;
            u.summoningSickness = false;
        });
    }

    private drawCard(playerId: PlayerId) {
        const deck = this.decks[playerId];
        if (deck.length === 0) {
            const other = playerId === 'player' ? 'opponent' : 'player';
            this.state.winner = other;
            this.state.log.push(`${playerId} deck empty! ${other} wins!`);
            return;
        }

        const card = deck.pop();
        if (card) {
            this.state.players[playerId].hand.push(card);
            this.state.players[playerId].deckCount = deck.length;
        }
    }

    private handlePlayCard(action: Action) {
        if (!action.cardId) return;
        const player = this.state.players[action.playerId];
        const index = player.hand.findIndex(c => c.instanceId === action.cardId || c.id === action.cardId);

        if (index === -1) return;
        const card = player.hand[index];

        // Validate Mana
        if (player.mana < card.currentCost) return;

        // Pay Mana
        player.mana -= card.currentCost;

        // Move Card
        player.hand.splice(index, 1);

        if ((card.type as any) === 'Unit' || (card.type as any) === 'Champion' || card.type === 'Legend' as any) {
            card.summoningSickness = !card.keywords?.includes('Rush');
            player.field.push(card);
            this.state.log.push(`${action.playerId} played unit: ${card.name}`);
        } else if (card.type === 'Spell') {
            const speed = (card as any).speed || 'Slow';

            if (speed === 'Burst') {
                this.state.log.push(`${action.playerId} cast Burst spell: ${card.name}`);
                player.graveyard.push(card);
                this.resolveSpell(card, action.targetId);
            } else {
                this.state.log.push(`${action.playerId} added ${speed} spell to stack: ${card.name}`);
                this.state.stack.push({
                    id: crypto.randomUUID(),
                    playerId: action.playerId,
                    cardId: card.instanceId,
                    targetId: action.targetId,
                    resolved: false
                });
                // Pass priority after casting a Fast/Slow spell
                this.state.priority = action.playerId === 'player' ? 'opponent' : 'player';
            }
        }
    }

    private handlePass(playerId: PlayerId) {
        if (this.state.priority !== playerId) return;

        const otherPlayer = playerId === 'player' ? 'opponent' : 'player';

        if (this.state.stack.length > 0) {
            // If there's a stack, passing resolves it
            this.state.log.push(`${playerId} passed. Resolving stack...`);
            this.resolveStack();
            this.state.priority = this.state.activePlayer; // Priority back to active player
        } else {
            // No stack, passing might end turn or pass priority
            if (this.state.priority === this.state.activePlayer) {
                // Active player passes, priority to opponent
                this.state.priority = otherPlayer;
                this.state.log.push(`${playerId} passes priority to ${otherPlayer}`);
            } else {
                // Non-active player passes after active player passed (both pass) -> End Turn
                this.state.log.push(`Both players passed. Ending turn.`);
                this.handleEndTurn();
            }
        }
    }

    private resolveStack() {
        // LIFO order (Last In First Out)
        while (this.state.stack.length > 0) {
            const item = this.state.stack.pop();
            if (!item) break;

            const player = this.state.players[item.playerId];
            // Find the runtime card (it might be in a temporary "limbo" if we want to be strict,
            // but for now let's assume it was just cast and we can find it by its instanceId
            // in the player's potential source of spell data).
            // Simplified: we'll just log and apply a generic effect for the prototype.
            this.state.log.push(`Stack: Resolving spell from ${item.playerId}`);

            // In a real implementation we would get the Card logic here
            // this.resolveSpell(card, item.targetId);
        }
    }

    private resolveSpell(card: RuntimeCard, targetId?: string) {
        if (targetId) {
            if (targetId === 'opponent' || targetId === 'player') {
                this.state.players[targetId as PlayerId].health -= 2;
                this.state.log.push(`Spell dealt 2 damage to ${targetId}`);
            }
        }
    }

    private handleDeclareAttackers(action: Action) {
        if (this.state.phase !== 'Main') return;
        if (!action.attackers || action.attackers.length === 0) return;

        this.state.phase = 'Combat';
        this.state.combat = {
            attackers: {},
            blockers: {},
            isCombatPhase: true,
            step: 'declare_blockers' // Next step
        };

        const opponentId = this.state.activePlayer === 'player' ? 'opponent' : 'player';

        action.attackers.forEach(attackerId => {
            const unit = this.state.players[this.state.activePlayer].field.find(c => c.instanceId === attackerId);
            if (unit && !unit.hasAttacked && !unit.summoningSickness) {
                if (this.state.combat) {
                    this.state.combat.attackers[attackerId] = opponentId;
                }
                unit.hasAttacked = true;
            }
        });

        // Priority passes to defender to block
        this.state.priority = opponentId;
    }

    private handleDeclareBlockers(action: Action) {
        if (!this.state.combat || this.state.combat.step !== 'declare_blockers') return;

        if (action.blockers) {
            this.state.combat.blockers = action.blockers;
        }

        this.state.combat.step = 'damage';
        this.handleResolveCombat();
    }

    private handleResolveCombat() {
        if (!this.state.combat) return;

        const result = CombatResolver.resolveCombat(this.state, this.state.combat);

        // 1. Apply Damage Events
        result.damageEvents.forEach(evt => {
            if (evt.targetId === 'player' || evt.targetId === 'opponent') {
                this.state.players[evt.targetId as PlayerId].health -= evt.amount;
            } else {
                ['player', 'opponent'].forEach(pid => {
                    const p = this.state.players[pid as PlayerId];
                    const unit = p.field.find(c => c.instanceId === evt.targetId);
                    if (unit) {
                        unit.currentHealth -= evt.amount;
                    }
                });
            }
        });

        // 2. Popped Barriers
        result.poppedBarriers.forEach(instanceId => {
            ['player', 'opponent'].forEach(pid => {
                const p = this.state.players[pid as PlayerId];
                const unit = p.field.find(u => u.instanceId === instanceId);
                if (unit) {
                    unit.isBarrierActive = false;
                    this.state.log.push(`${unit.name}'s Barrier popped!`);
                }
            });
        });

        // 3. Lifesteal Healing
        Object.entries(result.lifestealHeal).forEach(([pid, amount]) => {
            if (amount > 0) {
                const player = this.state.players[pid as PlayerId];
                player.health = Math.min(player.maxHealth, player.health + amount);
                this.state.log.push(`${pid} healed ${amount} from Lifesteal!`);
            }
        });

        // 4. Clean Dead Units
        ['player', 'opponent'].forEach(pid => {
            const p = this.state.players[pid as PlayerId];
            p.field = p.field.filter(u => u.currentHealth > 0);
        });

        // Check Win
        if (this.state.players.player.health <= 0) this.state.winner = 'opponent';
        if (this.state.players.opponent.health <= 0) this.state.winner = 'player';

        // End Combat
        this.state.combat = null;
        this.state.phase = 'Main';
        this.state.priority = this.state.activePlayer;
    }


    public exportReplay(p1Name: string = 'Player 1', p2Name: string = 'Player 2'): ReplayData {
        return {
            metadata: {
                date: new Date().toISOString(),
                p1Name,
                p2Name,
                winner: this.state.winner,
                engineVersion: '1.0.0-PRO'
            },
            initialState: {
                p1Deck: this.initialState?.p1Deck.map(c => c.id) || [],
                p2Deck: this.initialState?.p2Deck.map(c => c.id) || []
            },
            actions: this.state.actionHistory || []
        };
    }

    private handleEndTurn() {
        this.state.activePlayer = this.state.activePlayer === 'player' ? 'opponent' : 'player';
        this.startTurn();
    }
}
