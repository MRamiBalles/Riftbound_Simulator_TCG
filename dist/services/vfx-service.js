"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VfxService = void 0;
/**
 * VFX Service (Phase 24)
 * Manages hyper-sensory visual haptics for maximum dopamine.
 */
class VfxService {
    static listeners = new Set();
    static subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    static trigger(effect) {
        console.log(`[VFX_SERVICE] Triggering: ${effect}`);
        this.listeners.forEach(cb => cb(effect));
    }
    // CSS Utility Generators for Haptics
    static getScreenShakeClass() {
        return "animate-shake";
    }
    static getChromaticAberrationClass() {
        return "chromatic-aberration-pulse";
    }
}
exports.VfxService = VfxService;
