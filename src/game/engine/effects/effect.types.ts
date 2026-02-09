/**
 * @fileoverview Riftbound Effect System - Type Definitions
 * @version 1.0.0
 * 
 * Schema declarativo para efectos de cartas. Este archivo define el CONTRATO
 * de datos que permite serializar efectos para:
 * - Validación autoritativa del servidor
 * - Generación de cartas por IA
 * - Replays deterministas
 * 
 * @constitution Artículo IV §4.1 - Los efectos DEBEN ser datos, no código.
 */

// =============================================================================
// VERSION CONTROL
// =============================================================================

/** Schema version for client-server compatibility validation */
export const EFFECT_SCHEMA_VERSION = '1.0.0';

// =============================================================================
// EFFECT TRIGGERS - Cuándo se activa el efecto
// =============================================================================

export type EffectTrigger =
    | 'ON_PLAY'          // Cuando la carta entra al campo/se juega
    | 'ON_CAST'          // Para spells: al resolverse del stack
    | 'ON_ATTACK'        // Cuando la unidad declara ataque
    | 'ON_DEFEND'        // Cuando la unidad bloquea
    | 'ON_STRIKE'        // Cuando la unidad inflige daño en combate
    | 'ON_DEATH'         // Cuando la unidad muere
    | 'ON_TURN_START'    // Al inicio del turno del dueño
    | 'ON_TURN_END'      // Al final del turno del dueño
    | 'ON_DAMAGE_DEALT'  // Cuando cualquier daño es infligido
    | 'ON_DAMAGE_TAKEN'  // Cuando la unidad recibe daño
    | 'ON_HEAL'          // Cuando el dueño es curado
    | 'ON_ALLY_SUMMON'   // Cuando un aliado entra al campo
    | 'ON_ENEMY_SUMMON'  // Cuando un enemigo entra al campo
    | 'ON_SPELL_CAST'    // Cuando cualquier spell es jugado
    | 'ON_LEVEL_UP';     // Para campeones: al cumplir condición

// =============================================================================
// EFFECT ACTIONS - Qué hace el efecto
// =============================================================================

export type EffectAction =
    // Damage & Healing
    | 'DAMAGE'           // Infligir daño
    | 'HEAL'             // Curar vida
    | 'DRAIN'            // Daño + curación igual

    // Card Manipulation  
    | 'DRAW'             // Robar cartas
    | 'DISCARD'          // Descartar cartas
    | 'CREATE_IN_HAND'   // Crear carta en mano
    | 'SHUFFLE_INTO_DECK'// Barajar carta al mazo

    // Stat Modification
    | 'BUFF_ATTACK'      // +X ataque
    | 'BUFF_HEALTH'      // +X vida
    | 'SET_ATTACK'       // Fijar ataque a X
    | 'SET_HEALTH'       // Fijar vida a X
    | 'BUFF_COST'        // Modificar coste

    // Keywords
    | 'GRANT_KEYWORD'    // Añadir keyword permanente
    | 'GIVE_KEYWORD'     // Añadir keyword temporal (este turno)
    | 'REMOVE_KEYWORD'   // Quitar keyword

    // Unit Control
    | 'SUMMON'           // Invocar unidad
    | 'KILL'             // Destruir unidad
    | 'RECALL'           // Devolver a mano
    | 'CAPTURE'          // Capturar unidad
    | 'OBLITERATE'       // Eliminar sin activar ON_DEATH

    // Status Effects
    | 'STUN'             // Aturdir (no puede atacar/bloquear)
    | 'FROSTBITE'        // Reducir ataque a 0
    | 'SILENCE'          // Quitar todos los efectos

    // Mana
    | 'GAIN_MANA'        // Añadir maná este turno
    | 'REFILL_MANA'      // Rellenar cristales de maná
    | 'GAIN_SPELL_MANA'; // Añadir maná de spell

// =============================================================================
// EFFECT TARGETS - A quién afecta
// =============================================================================

export type EffectTarget =
    // Self & Owners
    | 'SELF'             // La carta que activa el efecto
    | 'OWNER'            // El jugador dueño de la carta
    | 'OPPONENT'         // El jugador enemigo
    | 'OWNER_NEXUS'      // Nexus del dueño
    | 'ENEMY_NEXUS'      // Nexus del enemigo

    // Selection (requiere input del jugador)
    | 'SELECTED_UNIT'    // Unidad elegida
    | 'SELECTED_ALLY'    // Aliado elegido
    | 'SELECTED_ENEMY'   // Enemigo elegido
    | 'SELECTED_ANY'     // Cualquier unidad o nexus

    // All Targets
    | 'ALL_UNITS'        // Todas las unidades
    | 'ALL_ALLIES'       // Todos los aliados
    | 'ALL_ENEMIES'      // Todos los enemigos
    | 'ALL_OTHER_ALLIES' // Aliados excepto self

    // Random (usa seed para determinismo)
    | 'RANDOM_ENEMY'     // Enemigo aleatorio
    | 'RANDOM_ALLY'      // Aliado aleatorio
    | 'RANDOM_UNIT'      // Cualquier unidad aleatoria

    // Combat Context
    | 'ATTACKER'         // Unidad atacante (en combate)
    | 'BLOCKER'          // Unidad bloqueadora (en combate)
    | 'COMBAT_OPPONENT'  // El oponente de combate de self

    // Card Zones
    | 'TOP_DECK'         // Carta superior del mazo
    | 'HAND';            // Todas las cartas en mano

// =============================================================================
// KEYWORDS - Para GRANT_KEYWORD y GIVE_KEYWORD
// =============================================================================

export type Keyword =
    | 'Barrier'
    | 'Challenger'
    | 'Double Attack'
    | 'Elusive'
    | 'Ephemeral'
    | 'Fearsome'
    | 'Fury'
    | 'Last Breath'
    | 'Lifesteal'
    | 'Overwhelm'
    | 'Quick Attack'
    | 'Regeneration'
    | 'Scout'
    | 'Spellshield'
    | 'Tough'
    | 'Vulnerable'
    | 'Rush';

// =============================================================================
// CONDITIONS - Cuándo puede activarse
// =============================================================================

export interface EffectCondition {
    type: ConditionType;
    value?: number;
    keyword?: Keyword;
    negate?: boolean;  // Invertir condición
}

export type ConditionType =
    | 'IF_DAMAGED'       // La unidad tiene daño
    | 'IF_FULL_HEALTH'   // La unidad tiene vida máxima
    | 'IF_BUFFED'        // La unidad tiene buffs
    | 'IF_ALONE'         // Es la única unidad en campo
    | 'IF_ATTACKING'     // Está atacando
    | 'IF_DEFENDING'     // Está bloqueando
    | 'IF_HAS_KEYWORD'   // Tiene keyword específica
    | 'IF_OWNER_DAMAGED' // El nexus del dueño tiene daño
    | 'IF_HAND_EMPTY'    // Mano vacía
    | 'IF_HAND_SIZE_GTE' // Mano >= X cartas
    | 'IF_FIELD_COUNT_GTE' // Campo >= X unidades
    | 'IF_TURN_GTE';     // Turno >= X

// =============================================================================
// CARD EFFECT - La unidad atómica de efecto
// =============================================================================

export interface CardEffect {
    /** Cuándo se activa este efecto */
    trigger: EffectTrigger;

    /** Qué hace el efecto */
    action: EffectAction;

    /** A quién afecta */
    target: EffectTarget;

    /** Magnitud del efecto (daño, curación, cartas, etc.) */
    value?: number;

    /** Para efectos con rango (ej. "1-3 daño") - usa seed para determinismo */
    valueMin?: number;
    valueMax?: number;

    /** Keyword para GRANT/GIVE/REMOVE_KEYWORD */
    keyword?: Keyword;

    /** Card ID para SUMMON/CREATE_IN_HAND */
    cardId?: string;

    /** Duración en turnos (undefined = permanente) */
    duration?: number;

    /** Condiciones para activar el efecto */
    conditions?: EffectCondition[];

    /** Efectos encadenados (ej. "Daño 2, luego roba 1") */
    then?: CardEffect[];
}

// =============================================================================
// EFFECT CONTEXT - Estado para resolver efectos
// =============================================================================

export interface EffectContext {
    /** Seed actual del RNG para efectos aleatorios */
    seed: number;

    /** ID de la carta que origina el efecto */
    sourceId: string;

    /** ID del dueño de la carta */
    ownerId: 'player' | 'opponent';

    /** Target seleccionado por el jugador (si requiere selección) */
    selectedTargetId?: string;

    /** Contexto de combate (si aplica) */
    combat?: {
        attackerId: string;
        blockerId?: string;
        isQuickAttack: boolean;
    };

    /** Turno actual */
    turn: number;
}

// =============================================================================
// EFFECT RESULT - Resultado de resolver un efecto
// =============================================================================

export interface EffectResult {
    /** IDs de unidades que murieron */
    deadUnits: string[];

    /** Eventos de daño */
    damageEvents: Array<{
        sourceId: string;
        targetId: string;
        amount: number;
    }>;

    /** Curación aplicada */
    healEvents: Array<{
        targetId: string;
        amount: number;
    }>;

    /** Cartas robadas */
    drawnCards: string[];

    /** Cartas invocadas */
    summonedCards: string[];

    /** Cambios al seed (para replays) */
    newSeed: number;

    /** Log de acciones para replay */
    log: string[];
}

// =============================================================================
// EXTENDED CARD DATA - Carta con efectos declarativos
// =============================================================================

export interface CardWithEffects {
    id: string;
    name: string;
    cost: number;
    type: 'Unit' | 'Spell' | 'Champion' | 'Landmark';
    attack?: number;
    health?: number;
    keywords?: Keyword[];

    /** Array de efectos declarativos */
    effects?: CardEffect[];

    /** Speed para spells */
    speed?: 'Burst' | 'Fast' | 'Slow' | 'Focus';

    /** Version del schema (para validación) */
    schemaVersion?: string;
}
