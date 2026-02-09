"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundService = void 0;
class SoundService {
    isMuted = false;
    volume = 0.5;
    // Mapping of effects to sample URLs (Public placeholders)
    soundMap = {
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
    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
    }
    setMute(m) {
        this.isMuted = m;
    }
    /**
     * Plays a sound effect with optional pitch variation for a natural feel.
     */
    play(effect, options = {}) {
        if (typeof window === 'undefined' || this.isMuted)
            return;
        const url = this.soundMap[effect];
        if (!url)
            return;
        const audio = new Audio(url);
        audio.volume = this.volume;
        if (options.delay) {
            setTimeout(() => audio.play().catch(() => { }), options.delay);
        }
        else {
            audio.play().catch(() => { });
        }
    }
}
exports.soundService = new SoundService();
