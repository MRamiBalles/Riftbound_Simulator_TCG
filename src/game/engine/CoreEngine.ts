import { MOCK_CARDS, getCardById } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { Action, PlayerId, SerializedGameState, SerializedPlayerState } from './game.types';

export class CoreEngine {
    private state: SerializedGameState;

    constructor(initialState?: SerializedGameState) {
        if (initialState) {
            this.state = JSON.parse(JSON.stringify(initialState));
        } else {
            this.state = this.createInitialState();
        }
    }

    private createInitialState(): SerializedGameState {
        return {
            turn: 1,
            activePlayer: 'player',
            phase: 'Main',
            players: {
                player: this.createPlayerState('player'),
                opponent: this.createPlayerState('opponent'),
            },
            winner: null,
            log: ['Game Started'],
        };
    }

    private createPlayerState(id: PlayerId): SerializedPlayerState {
        return {
            id,
            health: 20,
            maxHealth: 20,
            mana: 1,
            maxMana: 1,
            hand: [], // Should be dealt
            deckCount: 30,
            field: [],
            graveyard: [],
        };
    }

    public getState(): SerializedGameState {
        return JSON.parse(JSON.stringify(this.state));
    }

    public getLegalActions(playerId: PlayerId): Action[] {
        if (this.state.winner) return [];
        if (this.state.activePlayer !== playerId) return [];

        const actions: Action[] = [];
        const player = this.state.players[playerId];

        // End Turn is always legal in Main phase
        actions.push({ type: 'END_TURN', playerId });

        // Play Card
        player.hand.forEach(card => {
            if (card.cost <= player.mana) {
                actions.push({ type: 'PLAY_CARD', playerId, cardId: card.id });
            }
        });

        // Attack (Simplified: All units can attack if they check some condition, mostly relevant in Combat phase or if they have "Rush")
        // For MVP, letting units attack anytime in Main phase for simplicity of mock
        player.field.forEach(card => {
            // Mock target: opponent face
            actions.push({ type: 'ATTACK', playerId, cardId: card.id, targetId: 'opponent' });
        });

        return actions;
    }

    public applyAction(action: Action): SerializedGameState {
        if (this.state.winner) return this.state;

        // Log action
        this.state.log.push(`Player ${action.playerId} performed ${action.type}`);

        switch (action.type) {
            case 'END_TURN':
                this.handleEndTurn();
                break;
            case 'PLAY_CARD':
                if (action.cardId) this.handlePlayCard(action.playerId, action.cardId);
                break;
            case 'ATTACK':
                if (action.cardId) this.handleAttack(action.playerId, action.cardId);
                break;
        }

        return this.getState();
    }

    private handleEndTurn() {
        // Switch Player
        const nextPlayer = this.state.activePlayer === 'player' ? 'opponent' : 'player';
        this.state.activePlayer = nextPlayer;

        // Start of Turn Logic for new active player
        const player = this.state.players[nextPlayer];

        // Mana logic
        if (nextPlayer === 'player') {
            this.state.turn += 1;
            const newManaCap = Math.min(10, this.state.turn);
            player.maxMana = newManaCap;
            player.mana = newManaCap;
        } else {
            // Opponent (AI) also gets mana refill
            const opponentTurn = this.state.turn; // Synced turns for simplicity
            const newManaCap = Math.min(10, opponentTurn);
            player.maxMana = newManaCap;
            player.mana = newManaCap;
        }

        // Draw Card (Mock)
        if (player.hand.length < 10) {
            // Just cloning a random mock card for now
            const randomCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
            // Assign unique runtime ID
            const runtimeCard = { ...randomCard, id: randomCard.id + '-' + Math.random().toString(36).substr(2, 9) };
            player.hand.push(runtimeCard);
        }
    }

    private handlePlayCard(playerId: PlayerId, cardId: string) {
        const player = this.state.players[playerId];
        const cardIndex = player.hand.findIndex(c => c.id === cardId);

        if (cardIndex === -1) return; // Error handling
        const card = player.hand[cardIndex];

        if (player.mana < card.cost) return; // Illegal move check

        // Pay costs
        player.mana -= card.cost;

        // Move card
        player.hand.splice(cardIndex, 1);

        if (card.type === 'Spell') {
            player.graveyard.push(card);
            // Apply spell effect (simple damage for MVP)
            const opponentId = playerId === 'player' ? 'opponent' : 'player';
            this.state.players[opponentId].health -= 2; // Fixed 2 dmg for now
        } else {
            player.field.push(card);
        }
    }

    private handleAttack(playerId: PlayerId, cardId: string) {
        const player = this.state.players[playerId];
        const card = player.field.find(c => c.id === cardId);

        if (!card || !card.attack) return;

        // Direct damage to opponent face (MVP)
        const opponentId = playerId === 'player' ? 'opponent' : 'player';
        this.state.players[opponentId].health -= card.attack;

        // Check Win Condition
        if (this.state.players[opponentId].health <= 0) {
            this.state.winner = playerId;
            this.state.log.push(`Player ${playerId} WINS!`);
        }
    }
}
