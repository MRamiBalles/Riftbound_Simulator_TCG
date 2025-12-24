import { create } from 'zustand';
import { Card } from '@/lib/database.types';
import { MOCK_CARDS } from '@/services/card-service';

export type PlayerId = 'player' | 'opponent';
export type Phase = 'Draw' | 'Main' | 'Combat' | 'End';

interface GameState {
    turn: number;
    activePlayer: PlayerId;
    phase: Phase;

    player: {
        health: number;
        maxHealth: number;
        mana: number;
        maxMana: number;
        hand: Card[];
        deck: number;
        field: Card[];
        graveyard: Card[];
    };

    opponent: {
        health: number;
        maxHealth: number;
        mana: number;
        maxMana: number;
        handCount: number;
        deck: number;
        field: Card[];
        graveyard: Card[];
    };

    // Actions
    startGame: () => void;
    endTurn: () => void;
    playCard: (cardId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    turn: 1,
    activePlayer: 'player',
    phase: 'Main',

    player: {
        health: 20,
        maxHealth: 20,
        mana: 1,
        maxMana: 1,
        hand: [],
        deck: 30,
        field: [],
        graveyard: [],
    },

    opponent: {
        health: 20,
        maxHealth: 20,
        mana: 1,
        maxMana: 1,
        handCount: 4,
        deck: 30,
        field: [],
        graveyard: [],
    },

    startGame: () => {
        // Deal initial hands
        const initialHand = [MOCK_CARDS[0], MOCK_CARDS[2], MOCK_CARDS[3]];
        set((state) => ({
            ...state,
            player: { ...state.player, hand: initialHand },
        }));
    },

    endTurn: () => {
        set((state) => {
            const nextPlayer = state.activePlayer === 'player' ? 'opponent' : 'player';
            const isNewRound = nextPlayer === 'player';
            const nextTurn = isNewRound ? state.turn + 1 : state.turn;
            const nextMana = isNewRound ? Math.min(10, nextTurn) : state.player.mana;

            // Basic state flip
            return {
                activePlayer: nextPlayer,
                turn: nextTurn,
                player: {
                    ...state.player,
                    maxMana: isNewRound ? nextMana : state.player.maxMana,
                    mana: isNewRound ? nextMana : state.player.mana
                }
            };
        });
    },

    playCard: (cardId: string) => {
        const { player } = get();
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const card = player.hand[cardIndex];

        // Check mana
        if (player.mana < card.cost) return;

        // Move to field
        const newHand = [...player.hand];
        newHand.splice(cardIndex, 1);

        set((state) => ({
            player: {
                ...state.player,
                mana: state.player.mana - card.cost,
                hand: newHand,
                field: [...state.player.field, card],
            }
        }));
    }
}));
