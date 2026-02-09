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
import { EffectResolver, EffectContext, EffectTrigger } from './effects';

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
    public initGame(playerDeck: Card[], opponentDeck: Card[], seed?: number) {
        this.initialState = { p1Deck: [...playerDeck], p2Deck: [...opponentDeck] };
        this.state = this.createInitialState(seed);
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
            this.initGame(this.initialState.p1Deck, this.initialState.p2Deck, this.state.seed);
        }
    }

    private createInitialState(seed?: number): SerializedGameState {
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
            seed: seed ?? Math.floor(Math.random() * 1000000), // Default random seed
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
            spellMana: 0,
            hand: [],
            deck: [],
            deckCount: 0, // Deprecated but kept for compatibility
            field: [],
            graveyard: []
        };
    }

    private initializePlayer(id: PlayerId, deck: Card[]) {
        // Deterministic shuffle
        const shuffled = this.deterministicShuffle([...deck]);
        // Use seeded ID generation
        const runtimeDeck = shuffled.map(c => createRuntimeCard(c, id, this.generateUUID()));
        this.decks[id] = runtimeDeck;
        this.state.players[id].deckCount = runtimeDeck.length;
    }

    private deterministicShuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.nextRandom() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    private nextRandom(): number {
        // Linear Congruential Generator (LCG)
        // a = 1664525, c = 1013904223, m = 2^32
        this.state.seed = (1664525 * this.state.seed + 1013904223) % 4294967296;
        return this.state.seed / 4294967296;
    }

    private generateUUID(): string {
        // Simple seeded UUID-like string generator
        // Not RFC4122 compliant but unique and deterministic
        const s4 = () => Math.floor((1 + this.nextRandom()) * 0x10000).toString(16).substring(1);
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
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
        if (this.mulliganStatus[playerId]) {
            console.warn(`[CoreEngine] Player ${playerId} already mulliganed.`);
            return;
        }

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
            this.decks[playerId] = this.deterministicShuffle(deck);
            player.deckCount = this.decks[playerId].length;
        }

        // track which players have mulliganed
        this.mulliganStatus[playerId] = true;

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

        ['player', 'opponent'].forEach(pid => {
            const p = this.state.players[pid as PlayerId];

            // 1. Mana Logic
            p.maxMana = Math.min(10, p.maxMana + 1);
            p.mana = p.maxMana;

            // 2. Trigger ON_TURN_START
            p.field.forEach(u => this.triggerEffects(u, 'ON_TURN_START'));

            // 3. Regeneration Logic
            p.field.forEach(u => {
                if (u.keywords.includes('Regeneration' as any)) {
                    u.currentHealth = u.maxHealth;
                }
                // 4. Reset unit states
                u.hasAttacked = false;
                u.summoningSickness = false;
            });

            // Draw Card (Both players draw at start of round/turn)
            this.drawCard(pid as PlayerId);
        });

        this.state.phase = 'Draw';
        // (Draw handled in loop above)

        this.state.phase = 'Main';
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

            // Trigger ON_PLAY effects for units
            this.triggerEffects(card, 'ON_PLAY', action.targetId);
        } else if (card.type === 'Spell') {
            const speed = (card as any).speed || 'Slow';

            if (speed === 'Burst') {
                this.state.log.push(`${action.playerId} cast Burst spell: ${card.name}`);
                player.graveyard.push(card);
                this.resolveSpell(card, action.targetId);
            } else {
                this.state.log.push(`${action.playerId} added ${speed} spell to stack: ${card.name}`);
                this.state.stack.push({
                    id: this.generateUUID(),
                    playerId: action.playerId,
                    card: card,
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
            // If there's a stack, passing is checking if both passed
            if (this.state.priority === this.state.activePlayer) {
                // Active player passes, priority to opponent to react
                this.state.priority = otherPlayer;
                this.state.log.push(`${playerId} passes priority on stack to ${otherPlayer}`);
            } else {
                // Non-active player passes after active player passed -> Resolve TOP item
                this.state.log.push(`Both players passed. Resolving top of stack.`);
                this.resolveStackTop();
                // After resolution, priority returns to active player to continue or react
                this.state.priority = this.state.activePlayer;
            }
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

    private resolveStackTop() {
        if (this.state.stack.length === 0) return;

        const item = this.state.stack.pop();
        if (!item) return;

        const player = this.state.players[item.playerId];
        const card = item.card;

        this.state.log.push(`Stack: Resolving ${card.name} from ${item.playerId}`);

        // Find the card logic
        this.applyTargetEffect(card.instanceId, item.targetId, card);

        // Clean up: move to graveyard
        // It was already removed from hand in handlePlayCard
        player.graveyard.push(card);
    }

    private applyTargetEffect(sourceId: string, targetId: string | undefined, sourceCard?: RuntimeCard) {
        // Legacy fallback for cards without declarative effects
        if (sourceCard?.effects && sourceCard.effects.length > 0) {
            const context: EffectContext = {
                seed: this.state.seed,
                sourceId,
                ownerId: sourceCard.ownerId as PlayerId,
                selectedTargetId: targetId,
                turn: this.state.turn
            };

            const { state: newState, result } = EffectResolver.resolve(
                this.state,
                sourceCard,
                'ON_CAST',
                context
            );

            // Update state in place
            this.state = newState;
            this.state.log.push(...result.log);

            // Handle dead units
            this.cleanupDeadUnits(result.deadUnits);
            return;
        }

        // Fallback: Legacy hardcoded behavior for cards without effects array
        if (targetId === 'opponent' || targetId === 'player') {
            const targetPlayer = this.state.players[targetId as PlayerId];
            targetPlayer.health -= 2; // Default spell damage
            this.state.log.push(`Effect dealt 2 damage to ${targetId}`);
        } else {
            // Target is a unit
            ['player', 'opponent'].forEach(pid => {
                const p = this.state.players[pid as PlayerId];
                const unit = p.field.find(u => u.instanceId === targetId);
                if (unit) {
                    unit.currentHealth -= 2;
                    this.state.log.push(`Effect dealt 2 damage to unit: ${unit.name}`);
                    if (unit.currentHealth <= 0) {
                        this.state.log.push(`${unit.name} has been destroyed by spell.`);
                        p.field = p.field.filter(u => u.instanceId !== targetId);
                        p.graveyard.push(unit);
                    }
                }
            });
        }
    }

    private resolveSpell(card: RuntimeCard, targetId?: string) {
        // Try declarative effects first
        if (card.effects && card.effects.length > 0) {
            const context: EffectContext = {
                seed: this.state.seed,
                sourceId: card.instanceId,
                ownerId: card.ownerId as PlayerId,
                selectedTargetId: targetId,
                turn: this.state.turn
            };

            const { state: newState, result } = EffectResolver.resolve(
                this.state,
                card,
                'ON_CAST',
                context
            );

            this.state = newState;
            this.state.log.push(...result.log);
            this.cleanupDeadUnits(result.deadUnits);
            return;
        }

        // Fallback for legacy cards
        if (targetId) {
            if (targetId === 'opponent' || targetId === 'player') {
                this.state.players[targetId as PlayerId].health -= 2;
                this.state.log.push(`Spell dealt 2 damage to ${targetId}`);
            }
        }
    }

    /**
     * Helper to move dead units to graveyard after effect resolution.
     */
    private cleanupDeadUnits(deadUnitIds: string[]) {
        for (const unitId of deadUnitIds) {
            for (const playerId of ['player', 'opponent'] as PlayerId[]) {
                const player = this.state.players[playerId];
                const unitIndex = player.field.findIndex(u => u.instanceId === unitId);
                if (unitIndex !== -1) {
                    const unit = player.field.splice(unitIndex, 1)[0];
                    player.graveyard.push(unit);
                    this.state.log.push(`${unit.name} was destroyed.`);
                    // Dispatch ON_DEATH
                    this.triggerEffects(unit, 'ON_DEATH');
                }
            }
        }
    }

    /**
     * Triggers declarative effects for a card based on the specified trigger type.
     * @param card - The card whose effects should be triggered
     * @param trigger - The type of trigger (ON_PLAY, ON_ATTACK, etc.)
     * @param selectedTargetId - Optional target if effect requires selection
     */
    private triggerEffects(card: RuntimeCard, trigger: EffectTrigger, selectedTargetId?: string) {
        if (!card.effects || card.effects.length === 0) return;

        const context: EffectContext = {
            seed: this.state.seed,
            sourceId: card.instanceId,
            ownerId: card.ownerId as PlayerId,
            selectedTargetId,
            turn: this.state.turn
        };

        const { state: newState, result } = EffectResolver.resolve(
            this.state,
            card,
            trigger,
            context
        );

        this.state = newState;
        this.state.log.push(...result.log);
        this.cleanupDeadUnits(result.deadUnits);
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
                // Dispatch ON_ATTACK
                this.triggerEffects(unit, 'ON_ATTACK');
            }
        });

        // Priority passes to defender to block
        this.state.priority = opponentId;
    }

    private handleDeclareBlockers(action: Action) {
        if (!this.state.combat || this.state.combat.step !== 'declare_blockers') return;

        const defenderId = action.playerId;
        const attackerId = defenderId === 'player' ? 'opponent' : 'player';
        const defenderField = this.state.players[defenderId].field;
        const attackerField = this.state.players[attackerId].field;

        const validatedBlockers: Record<string, string> = {};

        if (action.blockers) {
            Object.entries(action.blockers).forEach(([blockerInstanceId, attackerInstanceId]) => {
                const blocker = defenderField.find(u => u.instanceId === blockerInstanceId);
                const attacker = attackerField.find(u => u.instanceId === attackerInstanceId);

                if (blocker && attacker) {
                    // ELUSIVE LOGIC: Can only block Elusive if blocker is Elusive.
                    // Non-Elusive units can be blocked by anyone.
                    const isAttackerElusive = attacker.keywords.includes('Elusive' as any);
                    const isBlockerElusive = blocker.keywords.includes('Elusive' as any);

                    if (isAttackerElusive && !isBlockerElusive) {
                        this.state.log.push(`Invalid block: ${blocker.name} cannot block Elusive ${attacker.name}`);
                    } else {
                        validatedBlockers[blockerInstanceId] = attackerInstanceId;
                    }
                }
            });

            this.state.combat.blockers = validatedBlockers;
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
                        // Log Unit Damage
                        this.state.log.push(`Dealt ${evt.amount} damage to ${unit.name}`);
                    }
                });
            }
            // Log Nexus Damage
            if (evt.targetId === 'player' || evt.targetId === 'opponent') {
                this.state.log.push(`Dealt ${evt.amount} damage to ${evt.targetId}`);
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
            const deadUnits = p.field.filter(u => u.currentHealth <= 0);
            p.graveyard.push(...deadUnits);
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
                p2Deck: this.initialState?.p2Deck.map(c => c.id) || [],
                seed: this.state.seed.toString()
            },
            actions: this.state.actionHistory || []
        };
    }

    private handleEndTurn() {
        // Dispatch ON_TURN_END for current active player units
        this.state.players[this.state.activePlayer].field.forEach(u => this.triggerEffects(u, 'ON_TURN_END'));

        this.state.activePlayer = this.state.activePlayer === 'player' ? 'opponent' : 'player';
        this.startTurn();
    }
}
