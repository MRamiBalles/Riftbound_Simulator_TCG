"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
/**
 * Neural Voice Service (Phase 16 -> Phase 44)
 * Simulates high-fidelity Champion voices and tactical AI commentary.
 */
class VoiceService {
    static isEnabled = true;
    static HERALD_LINES = {
        'SEASON_START': ["A new rift has been detected in the Genetic Origins sector.", "The cycle begins anew. Champions, prepare for expansion."],
        'HIGH_PRESTIGE': ["Your loyalty has been noted. The Genesis Eternal rank is within reach.", "Superior prestige detected. Ranking ascension imminent."],
        'MARKET_FRENZY': ["Auction house activity is at a zenith. High stakes detected.", "Bazaar volatility is shifting. Trade wisely, Riftwalker."]
    };
    static CHAMPION_LINES = {
        'CORE_001': {
            'PLAY': ["The Rift opens for me!", "Stand ready, the Guardian has arrived."],
            'ATTACK': ["For the Nexus!", "No passage here."],
            'LOW_HP': ["My light... it fades...", "I must hold the line..."]
        },
        'CORE_003': {
            'PLAY': ["Nature's wrath is blooming!", "The forest does not forget."],
            'ATTACK': ["Strike like the thorn!", "Vengeance is swift."],
            'LOW_HP': ["Back to the roots...", "I wither... but others will rise."]
        }
    };
    static async speak(line, speaker = 'The Herald', category = 'GENERAL') {
        if (!this.isEnabled)
            return;
        console.log(`[${category}] ${speaker.toUpperCase()}: "${line}"`);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(line);
            utterance.pitch = speaker === 'The Herald' ? 0.7 : 1.1;
            utterance.rate = 0.95;
        }
    }
    static triggerHerald(event) {
        const lines = this.HERALD_LINES[event];
        if (lines) {
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            this.speak(randomLine, 'The Herald', 'META_COMMENTARY');
        }
    }
    static triggerForAction(action, cardName, cardId) {
        if (!cardId || !this.CHAMPION_LINES[cardId])
            return;
        let category = 'PLAY';
        if (action.type === 'DECLARE_ATTACKERS')
            category = 'ATTACK';
        const lines = this.CHAMPION_LINES[cardId][category];
        if (lines) {
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            this.speak(randomLine, cardName || 'Champion', 'COMBAT');
        }
    }
    static triggerLowHP(playerId, health) {
        if (health > 0 && health <= 5) {
            this.speak("Calculated survivability is dropping. Defensive protocols failing.", 'The Herald', 'WARNING');
        }
    }
}
exports.VoiceService = VoiceService;
