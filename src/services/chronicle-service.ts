import { SerializedGameState as GameState } from '@/game/engine/game.types';

export interface LoreEncounter {
    id: string;
    title: string;
    description: string;
    reward: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ASCENDED';
    objective: string;
    dialogue: {
        intro: string[];
        victory: string[];
        defeat: string[];
    };
    initialStateOverride?: Partial<GameState>;
}

/**
 * Chronicle Service (Phase 18)
 * Manages the "Genesis" solo campaign missions and narrative flow.
 */
export class ChronicleService {
    private static ENCOUNTERS: LoreEncounter[] = [
        {
            id: 'chronicle-001',
            title: 'The Silent Nexus',
            description: 'The Nexus is dying. Its guardians are silent. Discover the source of the rot.',
            reward: 'Core Fragment',
            difficulty: 'EASY',
            objective: 'Defeat the Corrupted Sentinel.',
            dialogue: {
                intro: [
                    "Sentinel: Intruders... the Nexus must be... preserved...",
                    "Player: It's too late for the old laws. The Rift is changing."
                ],
                victory: [
                    "Sentinel: Perhaps... you are the key... to the new light.",
                    "Narrator: The path to the core is now open."
                ],
                defeat: [
                    "Sentinel: The rot... continues...",
                    "Narrator: Light fades from the Rift."
                ]
            }
        },
        {
            id: 'chronicle-002',
            title: 'Whispers of the Void',
            description: 'Shadows are gathering in the lower chambers. Prove your strength against the darkness.',
            reward: 'Void Essence',
            difficulty: 'MEDIUM',
            objective: 'Survive the shadow onslaught.',
            dialogue: {
                intro: [
                    "Voice from Void: You do not belong here, fleshling.",
                    "Player: I've walked through fire. Shadows won't stop me."
                ],
                victory: [
                    "Voice from Void: Improbable. You have the spark...",
                    "Narrator: You have earned the Void's respect."
                ],
                defeat: [
                    "Voice from Void: Another soul for the abyss.",
                    "Narrator: Darkness consumes all."
                ]
            }
        }
    ];

    public static getEncounters(): LoreEncounter[] {
        return this.ENCOUNTERS;
    }

    public static getEncounter(id: string): LoreEncounter | undefined {
        return this.ENCOUNTERS.find(e => e.id === id);
    }
}
