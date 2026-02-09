
import { z } from 'zod';

// Action Types based on game.types.ts
export const ActionTypeSchema = z.enum([
    'PLAY_CARD',
    'ATTACK',
    'BLOCK',
    'PASS',
    'END_TURN',
    // 'SURRENDER' ...
]);

export const ActionPayloadSchema = z.object({
    type: ActionTypeSchema,
    playerId: z.string(),
    cardId: z.string().optional(),
    targetId: z.string().optional(),
    blockers: z.record(z.string(), z.string()).optional(), // map attackerId -> blockerId
    position: z.number().optional()
});

// Top-level Message Schema
export const MessageSchema = z.object({
    type: z.enum(['ACTION', 'CHAT', 'JOIN', 'LEAVE']), // Add more as needed
    payload: z.unknown() // Refined based on type
});

export const ActionMessageSchema = z.object({
    type: z.literal('ACTION'),
    payload: ActionPayloadSchema
});

export const ChatMessageSchema = z.object({
    type: z.literal('CHAT'),
    payload: z.object({
        message: z.string().max(500) // Limit chat length
    })
});

// Combined Schema
export const IncomingMessageSchema = z.discriminatedUnion('type', [
    ActionMessageSchema,
    ChatMessageSchema,
    // Add JOIN if handled via message
]);

export type ActionPayload = z.infer<typeof ActionPayloadSchema>;
