import { Action, SerializedGameState } from '../game/engine/game.types';
import { AIService } from './ai-service';

export interface RoboticArmConfig {
    baseThinkingMean: number; // ms (Log-Normal Mean)
    baseThinkingSigma: number; // Log-Normal Standard Deviation
    baseMechanicalMean: number; // ms
    baseMechanicalSigma: number;
    maxBurstActions: number; // Token Bucket Capacity
    burstWindow: number; // ms
}

export class RoboticArmService {
    private static instance: RoboticArmService;
    private static isUIBusy: boolean = false;

    private config: RoboticArmConfig = {
        baseThinkingMean: 350,
        baseThinkingSigma: 0.5,
        baseMechanicalMean: 150,
        baseMechanicalSigma: 0.3,
        maxBurstActions: 22, // AlphaStar Standard
        burstWindow: 5000 // 5 seconds
    };

    private isRunning: boolean = false;
    private currentIntention: string | null = null;
    private actionHistory: number[] = [];

    private constructor() { }

    public static getInstance(): RoboticArmService {
        if (!RoboticArmService.instance) {
            RoboticArmService.instance = new RoboticArmService();
        }
        return RoboticArmService.instance;
    }

    /**
     * sovereign-semaphore: Static global lock to prevent the AI from interacting
     * while the UI is performing intensive animations.
     */
    public static setUIBusy(busy: boolean) {
        this.isUIBusy = busy;
    }

    private emitIntention(action: Action) {
        window.dispatchEvent(new CustomEvent('ROBOTIC_ARM_INTENTION', {
            detail: { ...action, timestamp: Date.now() }
        }));
    }

    /**
     * Generates a Log-Normal distributed delay.
     * Uses Box-Muller transform to generate Normal distribution, then exp().
     */
    private getLogNormalDelay(meanMs: number, sigma: number): number {
        const u = 1 - Math.random(); // Convert [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        // Transform standard normal to Log-Normal: exp(mu + sigma*z)
        // Adjust meanMs to log-scale mu
        const mu = Math.log(meanMs) - (sigma * sigma / 2);
        return Math.exp(mu + sigma * z);
    }

    /**
     * Token Bucket Rate Limiter (APM Check)
     * Enforces human-like burst limits.
     */
    private async enforceAPMLimit() {
        const now = Date.now();
        // Clean history older than window
        this.actionHistory = this.actionHistory.filter(t => now - t < this.config.burstWindow);

        if (this.actionHistory.length >= this.config.maxBurstActions) {
            console.warn('[RoboticArm] APM Limit Reached. Throttling...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Recovery penalty
        }
        this.actionHistory.push(now);
    }

    public static async executeAction(action: Action, onExecute: (a: Action) => void) {
        const instance = this.getInstance();
        if (RoboticArmService.isUIBusy) return;

        await instance.enforceAPMLimit();
        instance.emitIntention(action);

        const delay = instance.getLogNormalDelay(instance.config.baseMechanicalMean, instance.config.baseMechanicalSigma);
        await new Promise(resolve => setTimeout(resolve, delay));

        onExecute(action);
    }

    public async processGameState(state: SerializedGameState, onAction: (action: Action) => void) {
        if (!this.isRunning || RoboticArmService.isUIBusy) return;

        // Stage 1: Recognition (Thinking Time)
        const thinkingDelay = this.getLogNormalDelay(this.config.baseThinkingMean, this.config.baseThinkingSigma);

        this.currentIntention = "Analyzing tactical options...";
        await new Promise(resolve => setTimeout(resolve, thinkingDelay));

        try {
            const action = await AIService.getAction(state);

            if (action) {
                await this.enforceAPMLimit();
                this.currentIntention = this.formatActionIntention(action);
                this.emitIntention(action);

                // Stage 2: Mechanic Execution (Mouse Movement)
                const mechDelay = this.getLogNormalDelay(this.config.baseMechanicalMean, this.config.baseMechanicalSigma);
                await new Promise(resolve => setTimeout(resolve, mechDelay));

                onAction(action);
            } else {
                this.currentIntention = "Waiting for optimal moment...";
            }
        } catch (error) {
            console.error('[RoboticArm] AI Inference Error:', error);
            this.currentIntention = "Recalibrating neural link...";
        }
    }

    private formatActionIntention(action: Action): string {
        switch (action.type) {
            case 'PLAY_CARD':
                return `Playing card ${action.cardId || ''}`;
            case 'ATTACK_UNIT':
                return `Attacking target ${action.targetId || 'face'}`;
            case 'DECLARE_ATTACKERS':
                return `Committing ${action.attackers?.length || 0} attackers`;
            case 'END_TURN':
            case 'PASS':
                return "Ending tactical phase";
            default:
                return "Executing maneuver...";
        }
    }

    public start() {
        this.isRunning = true;
        console.log('[RoboticArm] Auto-Pilot engaged');
    }

    public stop() {
        this.isRunning = false;
        this.currentIntention = null;
        console.log('[RoboticArm] Auto-Pilot disengaged');
    }

    public getIntention(): string | null {
        return this.currentIntention;
    }

    public getIsRunning(): boolean {
        return this.isRunning;
    }
}

export const roboticArm = RoboticArmService.getInstance();
