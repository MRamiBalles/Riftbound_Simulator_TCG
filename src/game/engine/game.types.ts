import { Card } from '@/lib/database.types';

export type PlayerId = 'player' | 'opponent';
export type Phase = 'Draw' | 'Main' | 'Combat' | 'End';

export interface SerializedGameState {
    turn: number;
    activePlayer: PlayerId;
    phase: Phase;
    players: {
        [key in PlayerId]: SerializedPlayerState;
    };
    winner: PlayerId | null;
    log: string[];
}

export interface SerializedPlayerState {
    id: PlayerId;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    hand: Card[];
    deckCount: number;
    field: Card[];
    graveyard: Card[];
}

export type ActionType = 'PLAY_CARD' | 'ATTACK' | 'END_TURN';

export interface Action {
    type: ActionType;
    playerId: PlayerId;
    cardId?: string; // For Play and Attack
    targetId?: string; // For Attack or targeted spells
}
