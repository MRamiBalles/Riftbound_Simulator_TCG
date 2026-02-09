"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingMessageSchema = exports.ChatMessageSchema = exports.ActionMessageSchema = exports.MessageSchema = exports.ActionPayloadSchema = exports.ActionTypeSchema = void 0;
const zod_1 = require("zod");
// Action Types based on game.types.ts
exports.ActionTypeSchema = zod_1.z.enum([
    'PLAY_CARD',
    'ATTACK',
    'BLOCK',
    'PASS',
    'END_TURN',
    // 'SURRENDER' ...
]);
exports.ActionPayloadSchema = zod_1.z.object({
    type: exports.ActionTypeSchema,
    playerId: zod_1.z.string(),
    cardId: zod_1.z.string().optional(),
    targetId: zod_1.z.string().optional(),
    blockers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(), // map attackerId -> blockerId
    position: zod_1.z.number().optional()
});
// Top-level Message Schema
exports.MessageSchema = zod_1.z.object({
    type: zod_1.z.enum(['ACTION', 'CHAT', 'JOIN', 'LEAVE']), // Add more as needed
    payload: zod_1.z.unknown() // Refined based on type
});
exports.ActionMessageSchema = zod_1.z.object({
    type: zod_1.z.literal('ACTION'),
    payload: exports.ActionPayloadSchema
});
exports.ChatMessageSchema = zod_1.z.object({
    type: zod_1.z.literal('CHAT'),
    payload: zod_1.z.object({
        message: zod_1.z.string().max(500) // Limit chat length
    })
});
// Combined Schema
exports.IncomingMessageSchema = zod_1.z.discriminatedUnion('type', [
    exports.ActionMessageSchema,
    exports.ChatMessageSchema,
    // Add JOIN if handled via message
]);
