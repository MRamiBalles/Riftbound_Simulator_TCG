"use strict";
/**
 * @fileoverview EffectResolver - Motor de ejecución de efectos declarativos
 * @version 1.0.0
 *
 * Este sistema lee los efectos definidos en JSON y los ejecuta sobre el estado
 * del juego. Es la única fuente de verdad para la lógica de efectos.
 *
 * @constitution Artículo IV §4.2 - Los efectos DEBEN resolverse en orden LIFO.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectResolver = void 0;
// =============================================================================
// EFFECT RESOLVER - Main Class
// =============================================================================
class EffectResolver {
    /**
     * Resuelve todos los efectos de una carta para un trigger específico.
     *
     * @param state - Estado actual del juego
     * @param card - Carta que origina los efectos
     * @param trigger - Tipo de trigger a procesar
     * @param context - Contexto adicional (seed, targets, etc.)
     * @returns Nuevo estado modificado y resultado de efectos
     */
    static resolve(state, card, trigger, context) {
        const result = {
            deadUnits: [],
            damageEvents: [],
            healEvents: [],
            drawnCards: [],
            summonedCards: [],
            newSeed: context.seed,
            log: []
        };
        // Obtener efectos declarativos de la carta
        const effects = card.effects;
        if (!effects || effects.length === 0) {
            return { state, result };
        }
        // Filtrar efectos que matchean el trigger
        const matchingEffects = effects.filter(e => e.trigger === trigger);
        for (const effect of matchingEffects) {
            // Verificar condiciones
            if (!this.checkConditions(state, card, effect, context)) {
                result.log.push(`[Effect] Conditions not met for ${effect.action}`);
                continue;
            }
            // Ejecutar efecto
            const effectResult = this.executeEffect(state, card, effect, context);
            state = effectResult.state;
            this.mergeResults(result, effectResult.result);
            context.seed = effectResult.result.newSeed;
            // Procesar efectos encadenados (then)
            if (effect.then && effect.then.length > 0) {
                for (const chainedEffect of effect.then) {
                    const chainResult = this.executeEffect(state, card, chainedEffect, context);
                    state = chainResult.state;
                    this.mergeResults(result, chainResult.result);
                    context.seed = chainResult.result.newSeed;
                }
            }
        }
        result.newSeed = context.seed;
        return { state, result };
    }
    /**
     * Ejecuta un efecto individual.
     */
    static executeEffect(state, card, effect, context) {
        const result = {
            deadUnits: [],
            damageEvents: [],
            healEvents: [],
            drawnCards: [],
            summonedCards: [],
            newSeed: context.seed,
            log: []
        };
        // Resolver targets
        const targets = this.resolveTargets(state, card, effect.target, context);
        // Ejecutar acción por cada target
        for (const target of targets) {
            switch (effect.action) {
                case 'DAMAGE':
                    this.handleDamage(state, target, effect, context, result);
                    break;
                case 'HEAL':
                    this.handleHeal(state, target, effect, context, result);
                    break;
                case 'DRAW':
                    this.handleDraw(state, target, effect, context, result);
                    break;
                case 'BUFF_ATTACK':
                    this.handleBuffAttack(state, target, effect, result);
                    break;
                case 'BUFF_HEALTH':
                    this.handleBuffHealth(state, target, effect, result);
                    break;
                case 'GRANT_KEYWORD':
                case 'GIVE_KEYWORD':
                    this.handleGrantKeyword(state, target, effect, result);
                    break;
                case 'STUN':
                    this.handleStun(state, target, result);
                    break;
                case 'KILL':
                    this.handleKill(state, target, result);
                    break;
                case 'GAIN_MANA':
                    this.handleGainMana(state, target, effect, result);
                    break;
                default:
                    result.log.push(`[Effect] Unhandled action: ${effect.action}`);
            }
        }
        return { state, result };
    }
    // =========================================================================
    // TARGET RESOLUTION
    // =========================================================================
    static resolveTargets(state, card, target, context) {
        var _a, _b;
        const ownerId = context.ownerId;
        const opponentId = ownerId === 'player' ? 'opponent' : 'player';
        switch (target) {
            case 'SELF':
                return [{ type: 'unit', id: card.instanceId }];
            case 'OWNER':
            case 'OWNER_NEXUS':
                return [{ type: 'player', id: ownerId }];
            case 'OPPONENT':
            case 'ENEMY_NEXUS':
                return [{ type: 'player', id: opponentId }];
            case 'SELECTED_UNIT':
            case 'SELECTED_ALLY':
            case 'SELECTED_ENEMY':
            case 'SELECTED_ANY':
                if (context.selectedTargetId) {
                    // Determinar si es unidad o jugador
                    const isPlayer = context.selectedTargetId === 'player' || context.selectedTargetId === 'opponent';
                    return [{ type: isPlayer ? 'player' : 'unit', id: context.selectedTargetId }];
                }
                return [];
            case 'ALL_ALLIES':
                return state.players[ownerId].field.map(u => ({ type: 'unit', id: u.instanceId }));
            case 'ALL_ENEMIES':
                return state.players[opponentId].field.map(u => ({ type: 'unit', id: u.instanceId }));
            case 'ALL_UNITS':
                return [
                    ...state.players.player.field.map(u => ({ type: 'unit', id: u.instanceId })),
                    ...state.players.opponent.field.map(u => ({ type: 'unit', id: u.instanceId }))
                ];
            case 'RANDOM_ENEMY': {
                const enemies = state.players[opponentId].field;
                if (enemies.length === 0)
                    return [];
                const { value, newSeed } = this.nextRandom(context.seed, enemies.length);
                context.seed = newSeed;
                return [{ type: 'unit', id: enemies[value].instanceId }];
            }
            case 'RANDOM_ALLY': {
                const allies = state.players[ownerId].field;
                if (allies.length === 0)
                    return [];
                const { value, newSeed } = this.nextRandom(context.seed, allies.length);
                context.seed = newSeed;
                return [{ type: 'unit', id: allies[value].instanceId }];
            }
            case 'ATTACKER':
                if ((_a = context.combat) === null || _a === void 0 ? void 0 : _a.attackerId) {
                    return [{ type: 'unit', id: context.combat.attackerId }];
                }
                return [];
            case 'BLOCKER':
                if ((_b = context.combat) === null || _b === void 0 ? void 0 : _b.blockerId) {
                    return [{ type: 'unit', id: context.combat.blockerId }];
                }
                return [];
            default:
                return [];
        }
    }
    // =========================================================================
    // ACTION HANDLERS
    // =========================================================================
    static handleDamage(state, target, effect, context, result) {
        var _a;
        let amount = this.calculateValue(effect, context);
        if (target.type === 'player') {
            const player = state.players[target.id];
            player.health -= amount;
            result.damageEvents.push({ sourceId: context.sourceId, targetId: target.id, amount });
            result.log.push(`[Effect] Dealt ${amount} damage to ${target.id} nexus`);
            if (player.health <= 0) {
                state.winner = target.id === 'player' ? 'opponent' : 'player';
            }
        }
        else {
            const unit = this.findUnit(state, target.id);
            if (!unit)
                return;
            // Aplicar Tough
            if ((_a = unit.keywords) === null || _a === void 0 ? void 0 : _a.includes('Tough')) {
                amount = Math.max(0, amount - 1);
            }
            // Aplicar Barrier
            if (unit.isBarrierActive) {
                unit.isBarrierActive = false;
                result.log.push(`[Effect] Barrier blocked damage on ${unit.name}`);
                return;
            }
            unit.currentHealth -= amount;
            result.damageEvents.push({ sourceId: context.sourceId, targetId: target.id, amount });
            result.log.push(`[Effect] Dealt ${amount} damage to ${unit.name}`);
            if (unit.currentHealth <= 0) {
                result.deadUnits.push(unit.instanceId);
            }
        }
    }
    static handleHeal(state, target, effect, context, result) {
        const amount = this.calculateValue(effect, context);
        if (target.type === 'player') {
            const player = state.players[target.id];
            const healed = Math.min(amount, player.maxHealth - player.health);
            player.health += healed;
            result.healEvents.push({ targetId: target.id, amount: healed });
            result.log.push(`[Effect] Healed ${target.id} for ${healed}`);
        }
        else {
            const unit = this.findUnit(state, target.id);
            if (!unit)
                return;
            const healed = Math.min(amount, unit.maxHealth - unit.currentHealth);
            unit.currentHealth += healed;
            result.healEvents.push({ targetId: target.id, amount: healed });
            result.log.push(`[Effect] Healed ${unit.name} for ${healed}`);
        }
    }
    static handleDraw(state, target, effect, context, result) {
        if (target.type !== 'player')
            return;
        const amount = this.calculateValue(effect, context);
        const player = state.players[target.id];
        for (let i = 0; i < amount; i++) {
            if (player.deck.length === 0) {
                result.log.push(`[Effect] ${target.id} deck empty - cannot draw`);
                break;
            }
            const card = player.deck.shift();
            player.hand.push(card);
            result.drawnCards.push(card.instanceId);
        }
        result.log.push(`[Effect] ${target.id} drew ${result.drawnCards.length} cards`);
    }
    static handleBuffAttack(state, target, effect, result) {
        if (target.type !== 'unit')
            return;
        const unit = this.findUnit(state, target.id);
        if (!unit)
            return;
        const amount = effect.value || 0;
        unit.currentAttack += amount;
        result.log.push(`[Effect] ${unit.name} gained +${amount} attack`);
    }
    static handleBuffHealth(state, target, effect, result) {
        if (target.type !== 'unit')
            return;
        const unit = this.findUnit(state, target.id);
        if (!unit)
            return;
        const amount = effect.value || 0;
        unit.currentHealth += amount;
        unit.maxHealth += amount;
        result.log.push(`[Effect] ${unit.name} gained +${amount} health`);
    }
    static handleGrantKeyword(state, target, effect, result) {
        if (target.type !== 'unit' || !effect.keyword)
            return;
        const unit = this.findUnit(state, target.id);
        if (!unit)
            return;
        if (!unit.keywords)
            unit.keywords = [];
        if (!unit.keywords.includes(effect.keyword)) {
            unit.keywords.push(effect.keyword);
            result.log.push(`[Effect] ${unit.name} gained ${effect.keyword}`);
        }
    }
    static handleStun(state, target, result) {
        if (target.type !== 'unit')
            return;
        const unit = this.findUnit(state, target.id);
        if (!unit)
            return;
        unit.isStunned = true;
        result.log.push(`[Effect] ${unit.name} was stunned`);
    }
    static handleKill(state, target, result) {
        if (target.type !== 'unit')
            return;
        const unit = this.findUnit(state, target.id);
        if (!unit)
            return;
        unit.currentHealth = 0;
        result.deadUnits.push(unit.instanceId);
        result.log.push(`[Effect] ${unit.name} was killed`);
    }
    static handleGainMana(state, target, effect, result) {
        if (target.type !== 'player')
            return;
        const amount = effect.value || 0;
        const player = state.players[target.id];
        player.mana = Math.min(player.mana + amount, 10);
        result.log.push(`[Effect] ${target.id} gained ${amount} mana`);
    }
    // =========================================================================
    // CONDITION CHECKING
    // =========================================================================
    static checkConditions(state, card, effect, context) {
        var _a, _b, _c;
        if (!effect.conditions || effect.conditions.length === 0) {
            return true;
        }
        for (const condition of effect.conditions) {
            let passed = false;
            switch (condition.type) {
                case 'IF_DAMAGED':
                    passed = card.currentHealth < card.maxHealth;
                    break;
                case 'IF_FULL_HEALTH':
                    passed = card.currentHealth === card.maxHealth;
                    break;
                case 'IF_ALONE': {
                    const owner = state.players[context.ownerId];
                    passed = owner.field.length === 1;
                    break;
                }
                case 'IF_HAS_KEYWORD':
                    passed = (_b = (_a = card.keywords) === null || _a === void 0 ? void 0 : _a.includes(condition.keyword)) !== null && _b !== void 0 ? _b : false;
                    break;
                case 'IF_TURN_GTE':
                    passed = context.turn >= ((_c = condition.value) !== null && _c !== void 0 ? _c : 0);
                    break;
                default:
                    passed = true;
            }
            if (condition.negate)
                passed = !passed;
            if (!passed)
                return false;
        }
        return true;
    }
    // =========================================================================
    // UTILITY METHODS
    // =========================================================================
    static findUnit(state, instanceId) {
        for (const playerId of ['player', 'opponent']) {
            const unit = state.players[playerId].field.find(u => u.instanceId === instanceId);
            if (unit)
                return unit;
        }
        return null;
    }
    static calculateValue(effect, context) {
        var _a;
        if (effect.valueMin !== undefined && effect.valueMax !== undefined) {
            const range = effect.valueMax - effect.valueMin + 1;
            const { value, newSeed } = this.nextRandom(context.seed, range);
            context.seed = newSeed;
            return effect.valueMin + value;
        }
        return (_a = effect.value) !== null && _a !== void 0 ? _a : 0;
    }
    /**
     * Deterministic RNG using LCG - matches CoreEngine implementation
     */
    static nextRandom(seed, max) {
        const newSeed = (1664525 * seed + 1013904223) % 4294967296;
        const random = newSeed / 4294967296;
        const value = Math.floor(random * max);
        return { value, newSeed };
    }
    static mergeResults(target, source) {
        target.deadUnits.push(...source.deadUnits);
        target.damageEvents.push(...source.damageEvents);
        target.healEvents.push(...source.healEvents);
        target.drawnCards.push(...source.drawnCards);
        target.summonedCards.push(...source.summonedCards);
        target.log.push(...source.log);
    }
}
exports.EffectResolver = EffectResolver;
