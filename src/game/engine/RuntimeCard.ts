import { Card } from '@/lib/database.types';
import { Keyword } from './game.types';

export interface Enchantment {
    id: string;
    name: string;
    description: string;
    sourceCardId?: string;
    duration: 'turn' | 'permanent';
    statModifiers?: {
        attack?: number;
        health?: number;
        cost?: number;
    };
    addedKeywords?: Keyword[];
}

export interface RuntimeCard extends Card {
    instanceId: string;      // Unique UUID for this specific instance in game
    ownerId: string;         // 'player' or 'opponent'

    // Mutable Stats
    currentCost: number;
    currentAttack: number;
    currentHealth: number;   // Current HP (can go down with damage)
    maxHealth: number;       // Max HP (can be buffed)

    // State Flags
    hasAttacked: boolean;
    summoningSickness: boolean;
    isStunned: boolean;
    isBarrierActive: boolean;

    // Mechanics
    keywords: Keyword[];
    enchantments: Enchantment[];

    // UI Helper
    highlight?: boolean;
}

export function createRuntimeCard(card: Card, ownerId: string): RuntimeCard {
    return {
        ...card,
        instanceId: crypto.randomUUID(),
        ownerId,
        currentCost: card.cost,
        currentAttack: card.attack || 0,
        currentHealth: card.health || 0,
        maxHealth: card.health || 0,
        hasAttacked: false,
        summoningSickness: card.type === 'Unit', // Spells don't have sickness
        isStunned: false,
        isBarrierActive: false, // Default false, unless card has Barrier keyword conceptually
        keywords: [], // Initialize empty or parse from text if advanced
        enchantments: []
    };
}
