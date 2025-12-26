import { Card } from '@/lib/database.types';
import {
    Action,
    CombatState,
    PlayerId,
    SerializedGameState,
    SerializedPlayerState,
    Phase
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

    constructor(initialState?: SerializedGameState) {
        if (initialState) {
            this.state = JSON.parse(JSON.stringify(initialState));
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
        this.state = this.createInitialState();

        // Initialize Players
        this.initializePlayer('player', playerDeck);
        this.initializePlayer('opponent', opponentDeck);

        // Start Game
        this.state.log.push('Game Initialized');
        this.drawInitialHands();
        this.state.phase = 'Draw'; // Skip Mulligan for MVP, go straight to Draw
        this.startTurn();
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
            stack: []
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
        }

        return this.getState();
    }

    public getState(): SerializedGameState {
        return JSON.parse(JSON.stringify(this.state));
    }

    // --- GAME LOGIC ---

    private startTurn() {
        this.state.turn++;
        const active = this.state.activePlayer;
        this.state.priority = active; // Update priority matches active player

        // Mana Logic
        const player = this.state.players[active];
        player.maxMana = Math.min(10, player.maxMana + 1);
        player.mana = player.maxMana;

        this.state.phase = 'Draw';
        this.drawCard(active);

        this.state.phase = 'Main';

        // Reset unit states
        this.state.players[active].field.forEach(u => {
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

        if ((card.type as any) === 'Unit' || (card.type as any) === 'Champion') {
            card.summoningSickness = !card.keywords?.includes('Rush');
            player.field.push(card);
        } else if (card.type === 'Spell') {
            player.graveyard.push(card);
            this.resolveSpell(card, action.targetId);
        }
    }

    private resolveSpell(card: RuntimeCard, targetId?: string) {
        if (targetId) {
            if (targetId === 'opponent' || targetId === 'player') {
                this.state.players[targetId as PlayerId].health -= 2; // Flat 2 dmg mock
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

        // Apply Damage Events
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

        // Clean Dead Units
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

    private handleEndTurn() {
        this.state.activePlayer = this.state.activePlayer === 'player' ? 'opponent' : 'player';
        this.startTurn();
    }
}
