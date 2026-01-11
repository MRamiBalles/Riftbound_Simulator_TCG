import { AIService } from './ai-service';
import { roboticArm, RoboticArmService } from './robotic-arm-service';
import { SerializedGameState } from '../game/engine/game.types';

export class StressTestService {
    private static isRunning = false;

    /**
     * THE GAUNTLET: Endurance Test
     * Runs N consecutive inference cycles to check for memory leaks in ONNX Runtime.
     * Bypasses the RoboticArm's humanized delays to maximize throughput.
     */
    public static async runEnduranceTest(state: SerializedGameState, iterations: number = 100) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.group('🔥 [THE GAUNTLET] Endurance Test Started');
        console.log(`Target: ${iterations} iterations`);

        const startHeap = (performance as any).memory?.usedJSHeapSize;
        const startTime = performance.now();
        let errors = 0;

        try {
            for (let i = 0; i < iterations; i++) {
                if (i % 10 === 0) console.log(`Iteration ${i}/${iterations}...`);

                // Direct AI Service call (bypassing arm delay)
                await AIService.getAction(state);

                // Small breathing room for GC
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } catch (e) {
            console.error('Endurance Test Failed:', e);
            errors++;
        }

        const endHeap = (performance as any).memory?.usedJSHeapSize;
        const duration = (performance.now() - startTime) / 1000;

        console.log('--- REPORT ---');
        console.log(`Duration: ${duration.toFixed(2)}s`);
        console.log(`Errors: ${errors}`);
        if (startHeap && endHeap) {
            const diffMB = (endHeap - startHeap) / 1024 / 1024;
            console.log(`Heap Delta: ${diffMB.toFixed(2)} MB`);
        }
        console.groupEnd();
        this.isRunning = false;
    }

    /**
     * THE GAUNTLET: Chaos Monkey
     * Randomly toggles UI Semaphore and Auto-Pilot during AI thinking phase
     * to ensure the promise chain breaks gracefully without hanging the game state.
     */
    public static async runChaosTest(state: SerializedGameState) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.group('🐒 [THE GAUNTLET] Chaos Monkey Started');

        // Start the arm normally
        roboticArm.start();

        // Trigger a process cycle
        roboticArm.processGameState(state, (action) => {
            console.log('[Chaos] Action executed (survival)', action.type);
        });

        // DISRUPTION 1: Toggle Busy State mid-thought
        setTimeout(() => {
            console.log('[Chaos] 💥 INTERRUPT: Setting UI Busy');
            RoboticArmService.setUIBusy(true);
        }, 200);

        // DISRUPTION 2: Release Busy State
        setTimeout(() => {
            console.log('[Chaos] 🩹 HEAL: Releasing UI Busy');
            RoboticArmService.setUIBusy(false);
        }, 1500);

        // DISRUPTION 3: Hard Stop
        setTimeout(() => {
            console.log('[Chaos] 🛑 STOP: Disengaging Auto-Pilot');
            roboticArm.stop();
            this.isRunning = false;
            console.groupEnd();
        }, 3000);
    }
}
