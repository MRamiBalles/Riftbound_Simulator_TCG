"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRuntimeCard = createRuntimeCard;
function createRuntimeCard(card, ownerId, overrideId) {
    const keywords = card.keywords || [];
    const hasBarrier = keywords.includes('Barrier');
    const effects = card.effects || undefined;
    return {
        ...card,
        instanceId: overrideId || crypto.randomUUID(),
        ownerId,
        currentCost: card.cost,
        currentAttack: card.attack || 0,
        currentHealth: card.health || 0,
        maxHealth: card.health || 0,
        hasAttacked: false,
        summoningSickness: card.type === 'Unit',
        isStunned: false,
        isBarrierActive: hasBarrier,
        keywords: keywords,
        enchantments: [],
        effects: effects // Explicitly copy declarative effects
    };
}
