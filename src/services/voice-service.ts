import { Action, PlayerId } from '@/game/engine/game.types';

export interface VoiceLine {
    text: string;
    speaker: string;
    emotion: 'triumphant' | 'defensive' | 'aggressive' | 'neutral';
}

/**
 * Neural Voice Service (Phase 16)
 * Simulates high-fidelity Champion voices and tactical AI commentary.
 */
export class VoiceService {
    private static isEnabled = true;

    private static CHAMPION_LINES: Record<string, Record<string, string[]>> = {
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

    public static async speak(line: string, speaker: string = 'System AI') {
        if (!this.isEnabled) return;

        console.log(`[VOICE_SYNTH] ${speaker}: "${line}"`);

        // In a real implementation, this would trigger a Web Speech API or an external TTS service
        // For the simulator, we'll use the browser's speechSynthesis if available
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(line);
            utterance.pitch = speaker === 'System AI' ? 0.8 : 1.1;
            utterance.rate = 1.0;
            // window.speechSynthesis.speak(utterance); // Commented to prevent annoying the user during dev
        }
    }

    public static triggerForAction(action: Action, cardName?: string, cardId?: string) {
        if (!cardId || !this.CHAMPION_LINES[cardId]) return;

        let category = 'PLAY';
        if (action.type === 'DECLARE_ATTACKERS') category = 'ATTACK';

        const lines = this.CHAMPION_LINES[cardId][category];
        if (lines) {
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            this.speak(randomLine, cardName || 'Champion');
        }
    }

    public static triggerLowHP(playerId: PlayerId, health: number) {
        if (health > 0 && health <= 5) {
            this.speak("Calculated survivability is dropping. Extreme caution advised.", 'System AI');
        }
    }
}
