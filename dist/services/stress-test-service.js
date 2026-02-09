"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressTestService = void 0;
const ai_service_1 = require("./ai-service");
const robotic_arm_service_1 = require("./robotic-arm-service");
class StressTestService {
    static isRunning = false;
    /**
     * THE GAUNTLET: Endurance Test
     * Runs N consecutive inference cycles to check for memory leaks in ONNX Runtime.
     * Bypasses the RoboticArm's humanized delays to maximize throughput.
     */
    static async runEnduranceTest(state, iterations = 100) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.group('🔥 [THE GAUNTLET] Endurance Test Started');
        console.log(`Target: ${iterations} iterations`);
        const startHeap = performance.memory?.usedJSHeapSize;
        const startTime = performance.now();
        let errors = 0;
        try {
            for (let i = 0; i < iterations; i++) {
                if (i % 10 === 0)
                    console.log(`Iteration ${i}/${iterations}...`);
                // Direct AI Service call (bypassing arm delay)
                await ai_service_1.AIService.getAction(state);
                // Small breathing room for GC
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        catch (e) {
            console.error('Endurance Test Failed:', e);
            errors++;
        }
        const endHeap = performance.memory?.usedJSHeapSize;
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
    static async runChaosTest(state) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.group('🐒 [THE GAUNTLET] Chaos Monkey Started');
        // Start the arm normally
        robotic_arm_service_1.roboticArm.start();
        // Trigger a process cycle
        robotic_arm_service_1.roboticArm.processGameState(state, (action) => {
            console.log('[Chaos] Action executed (survival)', action.type);
        });
        // DISRUPTION 1: Toggle Busy State mid-thought
        setTimeout(() => {
            console.log('[Chaos] 💥 INTERRUPT: Setting UI Busy');
            robotic_arm_service_1.RoboticArmService.setUIBusy(true);
        }, 200);
        // DISRUPTION 2: Release Busy State
        setTimeout(() => {
            console.log('[Chaos] 🩹 HEAL: Releasing UI Busy');
            robotic_arm_service_1.RoboticArmService.setUIBusy(false);
        }, 1500);
        // DISRUPTION 3: Hard Stop
        setTimeout(() => {
            console.log('[Chaos] 🛑 STOP: Disengaging Auto-Pilot');
            robotic_arm_service_1.roboticArm.stop();
            this.isRunning = false;
            console.groupEnd();
        }, 3000);
    }
}
exports.StressTestService = StressTestService;
