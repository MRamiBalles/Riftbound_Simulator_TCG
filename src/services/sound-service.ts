/**
 * Service for handling game sounds and UI audio events.
 * Uses a registry-based approach to trigger sounds from anywhere in the app.
 */
export type SoundEffect =
    | 'CLICK' | 'HOVER' | 'CARD_DRAW' | 'CARD_PLAY'
    | 'ATTACK_LIGHT' | 'ATTACK_HEAVY' | 'NEXUS_HIT'
    | 'TURN_START' | 'VICTORY' | 'DEFEAT'
    | 'HEX_CHARGE' | 'HEX_UI_OPEN';

class SoundService {
    private isMuted: boolean = false;
    private volume: number = 0.5;

    // Mapping of effects to sample URLs (Public placeholders)
    private soundMap: Record<SoundEffect, string> = {
        'CLICK': 'https://assets.mixkit.co/sfx/preview/mixkit-button-click-interface-2586.mp3',
        'HOVER': 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-2395.mp3',
        'CARD_DRAW': 'https://assets.mixkit.co/sfx/preview/mixkit-poker-card-flick-2007.mp3',
        'CARD_PLAY': 'https://assets.mixkit.co/sfx/preview/mixkit-fast-sword-whoosh-2325.mp3',
        'ATTACK_LIGHT': 'https://assets.mixkit.co/sfx/preview/mixkit-quick-kick-2144.mp3',
        'ATTACK_HEAVY': 'https://assets.mixkit.co/sfx/preview/mixkit-heavy-punch-2150.mp3',
        'NEXUS_HIT': 'https://assets.mixkit.co/sfx/preview/mixkit-falling-hit-on-gravel-756.mp3',
        'TURN_START': 'https://assets.mixkit.co/sfx/preview/mixkit-camera-shutter-click-1133.mp3',
        'VICTORY': 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
        'DEFEAT': 'https://assets.mixkit.co/sfx/preview/mixkit-failure-drums-791.mp3',
        'HEX_CHARGE': 'https://assets.mixkit.co/sfx/preview/mixkit-electromagnetic-buzz-noise-3057.mp3',
        'HEX_UI_OPEN': 'https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-scanning-system-3107.mp3'
    };

    public setVolume(v: number) {
        this.volume = Math.max(0, Math.min(1, v));
    }

    public setMute(m: boolean) {
        this.isMuted = m;
    }

    /**
     * Plays a sound effect with optional pitch variation for a natural feel.
     */
    public play(effect: SoundEffect, options: { pitch?: number; delay?: number } = {}) {
        if (typeof window === 'undefined' || this.isMuted) return;

        const url = this.soundMap[effect];
        if (!url) return;

        const audio = new Audio(url);
        audio.volume = this.volume;

        if (options.delay) {
            setTimeout(() => audio.play().catch(() => { }), options.delay);
        } else {
            audio.play().catch(() => { });
        }
    }
}

export const soundService = new SoundService();
