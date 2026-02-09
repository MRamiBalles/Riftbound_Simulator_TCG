/**
 * @fileoverview Pilot cards with declarative effects
 * @version 1.0.0
 * 
 * These cards demonstrate the new Effect System.
 * Once validated, this pattern will be applied to riftbound-data.json
 */

import { CardWithEffects, EFFECT_SCHEMA_VERSION } from '../engine/effects/effect.types';

/**
 * Pilot cards migrated to declarative effect system.
 * IDs match original riftbound-data.json entries.
 */
export const PILOT_CARDS_WITH_EFFECTS: CardWithEffects[] = [
    // =========================================================================
    // DAMAGE ON ATTACK
    // =========================================================================
    {
        // Original: "When I attack, deal 3 to all enemy units here."
        id: 'OGN-293',  // Anivia - Primal
        name: 'Anivia - Primal',
        cost: 6,
        type: 'Unit',
        attack: 5,
        health: 4,
        keywords: ['Anivia', 'Freljord'],
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_ATTACK',
                action: 'DAMAGE',
                target: 'ALL_ENEMIES',
                value: 3
            }
        ]
    },

    // =========================================================================
    // STUN ON ATTACK
    // =========================================================================
    {
        // Original: "When I attack, stun an enemy unit here."
        id: 'OGN-PILOT-001',
        name: 'Ice Sentinel',
        cost: 4,
        type: 'Unit',
        attack: 3,
        health: 3,
        keywords: ['Freljord'],
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_ATTACK',
                action: 'STUN',
                target: 'SELECTED_ENEMY'
            }
        ]
    },

    // =========================================================================
    // DAMAGE SPELL (Burst)
    // =========================================================================
    {
        id: 'OGN-PILOT-002',
        name: 'Arcane Bolt',
        cost: 2,
        type: 'Spell',
        speed: 'Burst',
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_CAST',
                action: 'DAMAGE',
                target: 'SELECTED_ANY',
                value: 3
            }
        ]
    },

    // =========================================================================
    // HEAL SPELL (Fast)
    // =========================================================================
    {
        id: 'OGN-PILOT-003',
        name: 'Healing Light',
        cost: 2,
        type: 'Spell',
        speed: 'Fast',
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_CAST',
                action: 'HEAL',
                target: 'OWNER',
                value: 4
            }
        ]
    },

    // =========================================================================
    // DRAW SPELL
    // =========================================================================
    {
        id: 'OGN-PILOT-004',
        name: 'Deep Insight',
        cost: 3,
        type: 'Spell',
        speed: 'Slow',
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_CAST',
                action: 'DRAW',
                target: 'OWNER',
                value: 2
            }
        ]
    },

    // =========================================================================
    // BUFF ON PLAY
    // =========================================================================
    {
        id: 'OGN-PILOT-005',
        name: 'War Leader',
        cost: 5,
        type: 'Unit',
        attack: 4,
        health: 4,
        keywords: [],
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_PLAY',
                action: 'BUFF_ATTACK',
                target: 'ALL_OTHER_ALLIES',
                value: 1
            }
        ]
    },

    // =========================================================================
    // DRAIN (DAMAGE + HEAL)
    // =========================================================================
    {
        id: 'OGN-PILOT-006',
        name: 'Vampire Strike',
        cost: 4,
        type: 'Spell',
        speed: 'Fast',
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_CAST',
                action: 'DAMAGE',
                target: 'SELECTED_ENEMY',
                value: 3,
                then: [
                    {
                        trigger: 'ON_CAST',
                        action: 'HEAL',
                        target: 'OWNER',
                        value: 3
                    }
                ]
            }
        ]
    },

    // =========================================================================
    // GRANT KEYWORD ON PLAY
    // =========================================================================
    {
        id: 'OGN-PILOT-007',
        name: 'Shield Bearer',
        cost: 3,
        type: 'Unit',
        attack: 2,
        health: 3,
        keywords: ['Barrier'],
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_PLAY',
                action: 'GRANT_KEYWORD',
                target: 'ALL_ALLIES',
                keyword: 'Tough'
            }
        ]
    },

    // =========================================================================
    // CONDITIONAL EFFECT - Damage if damaged
    // =========================================================================
    {
        id: 'OGN-PILOT-008',
        name: 'Rage Elemental',
        cost: 4,
        type: 'Unit',
        attack: 4,
        health: 5,
        keywords: [],
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_ATTACK',
                action: 'DAMAGE',
                target: 'ENEMY_NEXUS',
                value: 2,
                conditions: [
                    { type: 'IF_DAMAGED' }
                ]
            }
        ]
    },

    // =========================================================================
    // RANDOM TARGET
    // =========================================================================
    {
        id: 'OGN-PILOT-009',
        name: 'Lightning Storm',
        cost: 5,
        type: 'Spell',
        speed: 'Slow',
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_CAST',
                action: 'DAMAGE',
                target: 'RANDOM_ENEMY',
                value: 4
            },
            {
                trigger: 'ON_CAST',
                action: 'DAMAGE',
                target: 'RANDOM_ENEMY',
                value: 4
            }
        ]
    },

    // =========================================================================
    // KILL + DRAW (Complex combo)
    // =========================================================================
    {
        id: 'OGN-PILOT-010',
        name: 'Ruthless Hunter',
        cost: 6,
        type: 'Unit',
        attack: 5,
        health: 5,
        keywords: ['Quick Attack'],
        schemaVersion: EFFECT_SCHEMA_VERSION,
        effects: [
            {
                trigger: 'ON_PLAY',
                action: 'KILL',
                target: 'SELECTED_ENEMY',
                then: [
                    {
                        trigger: 'ON_PLAY',
                        action: 'DRAW',
                        target: 'OWNER',
                        value: 1
                    }
                ]
            }
        ]
    }
];

/**
 * Lookup map for quick access by ID
 */
export const PILOT_CARDS_MAP: Map<string, CardWithEffects> = new Map(
    PILOT_CARDS_WITH_EFFECTS.map(card => [card.id, card])
);

/**
 * Get a pilot card by ID
 */
export function getPilotCard(id: string): CardWithEffects | undefined {
    return PILOT_CARDS_MAP.get(id);
}
