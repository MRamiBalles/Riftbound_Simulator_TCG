/**
 * VFX Service (Phase 24)
 * Manages hyper-sensory visual haptics for maximum dopamine.
 */
export class VfxService {
    private static listeners: Set<(effect: string) => void> = new Set();

    public static subscribe(callback: (effect: string) => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    public static trigger(effect: 'CRITICAL_HIT' | 'PACK_OPEN' | 'VICTORY') {
        console.log(`[VFX_SERVICE] Triggering: ${effect}`);
        this.listeners.forEach(cb => cb(effect));
    }

    // CSS Utility Generators for Haptics
    public static getScreenShakeClass(): string {
        return "animate-shake";
    }

    public static getChromaticAberrationClass(): string {
        return "chromatic-aberration-pulse";
    }
}
