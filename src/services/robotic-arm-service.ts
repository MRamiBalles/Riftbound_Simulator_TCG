import { Action, SerializedGameState } from '../game/engine/game.types';
import { AIService } from './ai-service';

export interface RoboticArmConfig {
    baseLatency: number; // ms
    stochasticVariance: number; // ms
}

export class RoboticArmService {
    private static instance: RoboticArmService;
    private static isUIBusy: boolean = false;

    private config: RoboticArmConfig = {
        baseLatency: 800,
        stochasticVariance: 400
    };
    private isRunning: boolean = false;
    private currentIntention: string | null = null;

    private constructor() { }

    public static getInstance(): RoboticArmService {
        if (!RoboticArmService.instance) {
            RoboticArmService.instance = new RoboticArmService();
        }
        return RoboticArmService.instance;
    }

    /**
     * sovereign-semaphore: Static global lock to prevent the AI from interacting
     * while the UI is performing intensive animations (Combat, Phase transitions).
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
     * Executes a single action with humanized latency.
     * Used by external callers that need controlled AI injection.
     */
    public static async executeAction(action: Action, onExecute: (a: Action) => void) {
        const instance = this.getInstance();
        if (RoboticArmService.isUIBusy) return;

        instance.emitIntention(action);

        const delay = instance.config.baseLatency + Math.random() * instance.config.stochasticVariance;
        await new Promise(resolve => setTimeout(resolve, delay));

        onExecute(action);
    }

    /**
     * Main autonomous loop processing.
     * Implements a two-stage "thinking" process for maximum humanization.
     */
    public async processGameState(state: SerializedGameState, onAction: (action: Action) => void) {
        if (!this.isRunning || RoboticArmService.isUIBusy) return;

        // Stage 1: Recognition Delay (Mimic human reaction time to state change)
        const delay = this.config.baseLatency + Math.random() * this.config.stochasticVariance;
        this.currentIntention = "Analyzing tactical options...";
        await new Promise(resolve => setTimeout(resolve, delay * 0.4));

        try {
            const action = await AIService.getAction(state);

            if (action) {
                this.currentIntention = this.formatActionIntention(action);
                this.emitIntention(action);

                // Stage 2: Interaction Delay (Mimic tactical selection/confirmation)
                await new Promise(resolve => setTimeout(resolve, delay * 0.6));
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
