import { Card } from '@/lib/database.types';
import { RuntimeCard } from './RuntimeCard';

export type PlayerId = 'player' | 'opponent';
export type Phase = 'Draw' | 'Mulligan' | 'Main' | 'Combat' | 'End';
export type TurnPhase = 'Start' | 'Mulligan' | 'Play' | 'Combat' | 'End'; // More granular if needed

export type Keyword = 'Rush' | 'Barrier' | 'Overwhelm' | 'Elusive' | 'Tough' | 'Regeneration' | 'Quick Attack' | 'Lifesteal';
export type TargetType = 'face' | 'unit' | 'any';
export type SpellSpeed = 'Burst' | 'Fast' | 'Slow';

export interface CombatState {
    attackers: Record<string, string>; // attackerId -> targetId (usually opponent face or unit if challenged)
    blockers: Record<string, string>;  // blockerId -> attackerId
    isCombatPhase: boolean;
    step: 'declare_attackers' | 'declare_blockers' | 'damage' | 'cleanup';
}

export interface SerializedGameState {
    turn: number;
    activePlayer: PlayerId;
    phase: Phase;
    priority: PlayerId; // Who has priority to act
    players: {
        [key in PlayerId]: SerializedPlayerState;
    };
    winner: PlayerId | null;
    log: string[];
    combat: CombatState | null;
    stack: StackItem[]; // Spell/Ability stack
    actionHistory?: Action[]; // For replays
}

export interface ReplayData {
    metadata: {
        date: string;
        p1Name: string;
        p2Name: string;
        winner: PlayerId | null;
        engineVersion: string;
    };
    initialState: {
        p1Deck: string[]; // Card IDs
        p2Deck: string[]; // Card IDs
        seed?: string;
    };
    actions: Action[];
}

export interface StackItem {
    id: string;
    playerId: PlayerId;
    cardId: string;
    targetId?: string;
    resolved: boolean;
}

export interface SerializedPlayerState {
    id: PlayerId;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number; /* Spell mana could be added here later */
    hand: RuntimeCard[];
    deckCount: number;
    field: RuntimeCard[];
    graveyard: RuntimeCard[];
}

export type ActionType =
    | 'PLAY_CARD'
    | 'ATTACK_UNIT' // Targeting a specific unit (e.g. Challenger) or Face
    | 'DECLARE_ATTACKERS' // Commit attack
    | 'DECLARE_BLOCKERS'
    | 'BLOCK'
    | 'RESOLVE_COMBAT'
    | 'PASS' // Pass priority
    | 'SELECT_MULLIGAN'
    | 'END_TURN';

export interface Action {
    type: ActionType;
    playerId: PlayerId;
    cardId?: string;
    targetId?: string;
    attackers?: string[]; // IDs of attacking units
    blockers?: Record<string, string>; // blockerId -> attackerId map
    mulliganCards?: string[]; // Cards to swap during Mulligan
}
