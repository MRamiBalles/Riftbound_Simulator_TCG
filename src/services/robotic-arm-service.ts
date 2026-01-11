/**
 * SOVEREIGN AUTO-PILOT (Robotic Arm)
 * Protocol: AlphaStar-V2
 * Purpose: Human-like UI interaction for AI Agents in Riftbound Simulator.
 */

import { Action, SerializedGameState } from '../game/engine/game.types';

export enum ArmState {
    IDLE = 'IDLE',
    THINKING = 'THINKING',
    MOVING = 'MOVING',
    WAITING_FOR_UI = 'WAITING_FOR_UI',
    SLEEPING = 'SLEEPING'
}

export interface TelemetryEvent {
    timestamp: number;
    actionType: string;
    latency: number;
    wasBlocked: boolean;
    apmAtMoment: number;
}

class ActionRateLimiter {
    private tokens: number = 22; // Maximum burst (22 actions per 5s window)
    private refillRate: number = 4.4; // Tokens per second (approx 260 APM)
    private lastRefill: number = Date.now();

    public canAct(): boolean {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }

    private refill() {
        const now = Date.now();
        const delta = (now - this.lastRefill) / 1000;
        this.tokens = Math.min(22, this.tokens + delta * this.refillRate);
        this.lastRefill = now;
    }

    public get currentTokens(): number {
        return this.tokens;
    }
}

export class RoboticArmService {
    private static state: ArmState = ArmState.IDLE;
    private static limiter = new ActionRateLimiter();
    private static telemetry: TelemetryEvent[] = [];
    private static isUIBusy: boolean = false;

    /**
     * STOCHASTIC LATENCY MODEL (Gamma-like distribution approximation)
     * Average thinking delay: 350ms - 800ms
     * Average mechanical delay: 150ms - 300ms
     */
    private static getStochasticDelay(type: 'THINKING' | 'MECHANICAL'): number {
        const base = type === 'THINKING' ? 350 : 150;
        const jitter = Math.random() * (type === 'THINKING' ? 450 : 150);
        // Add a "heavy thought" weight (10% chance for a longer pause)
        const weight = Math.random() > 0.9 ? 1.5 : 1;
        return (base + jitter) * weight;
    }

    /**
     * UI SEMAPHORE
     * Invoked from Board components to lock/unlock the arm.
     */
    public static setUIBusy(busy: boolean) {
        this.isUIBusy = busy;
        if (!busy) {
            console.log('[RoboticArm] UI Stable. Ready for next action.');
        }
    }

    /**
     * MAIN DISPATCHER
     * Receives a logical action and executes it with humanoid delays.
     */
    public static async executeAction(action: Action, performActionFn: (a: Action) => void) {
        if (this.state !== ArmState.IDLE) return;

        // 1. RATE LIMITING (Token Bucket)
        if (!this.limiter.canAct()) {
            console.warn('[RoboticArm] Rate Limit Exceeded (APM Limiter). Skipping action.');
            this.recordTelemetry(action.type, 0, true);
            return;
        }

        // 2. THINKING PHASE
        this.state = ArmState.THINKING;
        const thinkingDelay = this.getStochasticDelay('THINKING');
        await new Promise(r => setTimeout(r, thinkingDelay));

        // 3. UI MUTEX CHECK
        if (this.isUIBusy) {
            console.warn('[RoboticArm] UI Busy (Semaphore Block). Action rejected.');
            this.recordTelemetry(action.type, thinkingDelay, true);
            this.state = ArmState.IDLE;
            return;
        }

        // 4. MECHANICAL PHASE (Drag & Drop Simulation)
        this.state = ArmState.MOVING;
        const mechanicalDelay = this.getStochasticDelay('MECHANICAL');

        // Simulating the "Lead time" for intention overlay
        this.notifyIntention(action);
        await new Promise(r => setTimeout(r, 200)); // Intention Arrow visible for 200ms

        await new Promise(r => setTimeout(r, mechanicalDelay));

        // 5. EXECUTION
        performActionFn(action);
        this.recordTelemetry(action.type, thinkingDelay + mechanicalDelay + 200, false);

        // 6. COOLDOWN
        this.state = ArmState.IDLE;
    }

    private static notifyIntention(action: Action) {
        // Broadcast custom event for GameBoard to draw arrows
        const event = new CustomEvent('ROBOTIC_ARM_INTENTION', { detail: action });
        window.dispatchEvent(event);
    }

    private static recordTelemetry(type: string, latency: number, blocked: boolean) {
        this.telemetry.push({
            timestamp: Date.now(),
            actionType: type,
            latency,
            wasBlocked: blocked,
            apmAtMoment: Math.round((22 - this.limiter.currentTokens) * 12) // Rough APM estimation
        });

        if (this.telemetry.length > 100) this.telemetry.shift();
    }

    public static getDiagnostics() {
        return {
            state: this.state,
            tokensAvailable: this.limiter.currentTokens.toFixed(1),
            lastActions: this.telemetry.slice(-5),
            collisionRate: (this.telemetry.filter(t => t.wasBlocked).length / (this.telemetry.length || 1) * 100).toFixed(1) + '%'
        };
    }
}
