import { Card } from '@/lib/database.types';

export interface ForgedCard extends Card {
    isCustom: boolean;
    prompt: string;
    generationSeed: string;
    description?: string;
}

/**
 * Forge Service (Phase 20)
 * Simulates Generative AI card creation with balancing logic.
 */
export class ForgeService {
    public static async forge(prompt: string): Promise<ForgedCard> {
        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Deterministic generation based on prompt hash
        const seed = prompt.length.toString();
        const cost = Math.floor(Math.random() * 8) + 1;

        // Balanced stats logic
        const statPool = cost * 2 + 2;
        const attack = Math.floor(Math.random() * (statPool - 1)) + 1;
        const health = statPool - attack;

        const regions = ['Nexus', 'Demacia', 'Noxus', 'Ionia', 'Freljord', 'Shadow Isles', 'Void'];
        const region = regions[Math.floor(Math.random() * regions.length)];

        return {
            id: `forge-${Math.random().toString(36).substring(2, 9)}`,
            name: prompt.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Void Anomaly',
            cost,
            attack,
            health,
            region,
            rarity: cost > 6 ? 'Epic' : cost > 4 ? 'Rare' : 'Common',
            type: 'Unit',
            subtypes: [region],
            text: `Forged from the prompt: "${prompt}". Balanced for the ${region} region.`,
            set_id: 'FORGE',
            collector_number: '001',
            image_url: '/cards/forge-template.png',
            isCustom: true,
            prompt,
            generationSeed: seed,
            description: `Forged from the prompt: "${prompt}". Balanced for the ${region} region.`
        };
    }
}
