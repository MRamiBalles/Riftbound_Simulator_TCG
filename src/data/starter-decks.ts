import { Card } from '@/lib/database.types';
import OFFICIAL_CARDS_RAW from '@/data/official-cards.json';

const ALL_CARDS = OFFICIAL_CARDS_RAW as unknown as Card[];

export interface StarterDeck {
    id: string;
    name: string;
    description: string;
    regions: string[];
    mainChampions: string[];
    cards: { name: string; count: number }[];
}

export const STARTER_DECKS: StarterDeck[] = [
    {
        id: 'deck-spider-aggro',
        name: 'Spider Aggro',
        description: 'Overwhelm your opponent with a swarm of cheap spiders. Great for beginners.',
        regions: ['Noxus', 'Shadow Isles'],
        mainChampions: ['Elise', 'Darius'],
        cards: [
            { name: 'Elise', count: 3 },
            { name: 'Darius', count: 1 },
            { name: 'Legion Rearguard', count: 3 },
            { name: 'Precious Pet', count: 3 },
            { name: 'Hapless Aristocrat', count: 3 },
            { name: 'Arachnoid Horror', count: 3 },
            { name: 'House Spider', count: 3 },
            { name: 'Frenzied Skitterer', count: 3 },
            { name: 'Brood Awakening', count: 2 },
            { name: 'Decimate', count: 3 },
            { name: 'Noxian Fervor', count: 3 },
            { name: 'Vile Feast', count: 3 },
            { name: 'Glimpse Beyond', count: 3 },
            { name: 'Stalking Shadows', count: 2 },
            { name: 'Doombeast', count: 2 }
        ]
    },
    {
        id: 'deck-demacia-elites',
        name: 'Demacia Elites',
        description: 'Midrange deck focused on units with high stats and combat tricks.',
        regions: ['Demacia'],
        mainChampions: ['Garen', 'Jarvan IV'],
        cards: [
            { name: 'Garen', count: 3 },
            { name: 'Jarvan IV', count: 3 },
            { name: 'Cithria of Cloudfield', count: 3 },
            { name: 'Vanguard Defender', count: 3 },
            { name: 'Battlesmith', count: 3 },
            { name: 'Vanguard Sergeant', count: 3 },
            { name: 'Silverwing Vanguard', count: 3 },
            { name: 'Cithria the Bold', count: 3 },
            { name: 'Single Combat', count: 3 },
            { name: 'Sharpsight', count: 3 },
            { name: 'Concerted Strike', count: 3 },
            { name: 'Judgment', count: 1 },
            { name: 'Golden Aegis', count: 2 },
            { name: 'Relentless Pursuit', count: 1 },
            { name: 'Brightsteel Protector', count: 3 }
        ]
    },
    {
        id: 'deck-pirate-aggro',
        name: 'Pirate Aggro',
        description: 'Fast-paced deck combining Bilgewater damage and Noxus aggression.',
        regions: ['Bilgewater', 'Noxus'],
        mainChampions: ['Miss Fortune', 'Gangplank'],
        cards: [
            { name: 'Miss Fortune', count: 3 },
            { name: 'Gangplank', count: 3 },
            { name: 'Legion Saboteur', count: 3 },
            { name: 'Jagged Butcher', count: 3 },
            { name: 'Crackshot Corsair', count: 3 },
            { name: 'Imperial Demolitionist', count: 3 },
            { name: 'Marai Warden', count: 3 },
            { name: 'Zap Sprayfin', count: 3 },
            { name: 'Noxian Fervor', count: 3 },
            { name: 'Decimate', count: 3 },
            { name: 'Make it Rain', count: 3 },
            { name: 'Double Up', count: 2 },
            { name: 'Jack, the Winner', count: 2 },
            { name: 'Parrrley', count: 3 }
        ]
    },
    {
        id: 'deck-deep-monsters',
        name: 'Deep Monsters',
        description: 'Toss cards to go Deep, then summon massive Sea Monsters.',
        regions: ['Bilgewater', 'Shadow Isles'],
        mainChampions: ['Nautilus', 'Maokai'],
        cards: [
            { name: 'Nautilus', count: 3 },
            { name: 'Maokai', count: 3 },
            { name: 'Dreg Dredgers', count: 3 },
            { name: 'Sea Scarab', count: 3 },
            { name: 'Deadbloom Wanderer', count: 3 },
            { name: 'Jaull Hunters', count: 3 },
            { name: 'Abyssal Eye', count: 3 },
            { name: 'Devourer of the Depths', count: 3 },
            { name: 'Shipwreck Hoarder', count: 1 },
            { name: 'Jettison', count: 3 },
            { name: 'Salvage', count: 3 },
            { name: 'Vengeance', count: 2 },
            { name: 'Atrocity', count: 1 },
            { name: 'The Withering Wail', count: 2 },
            { name: 'Lure of the Depths', count: 3 }
        ]
    },
    {
        id: 'deck-shen-fiora',
        name: 'Shen Fiora Barrier',
        description: 'Protect Fiora with Barriers to win via her special condition.',
        regions: ['Demacia', 'Ionia'],
        mainChampions: ['Fiora', 'Shen'],
        cards: [
            { name: 'Fiora', count: 3 },
            { name: 'Shen', count: 3 },
            { name: 'Greenglade Caretaker', count: 3 },
            { name: 'Brightsteel Protector', count: 3 },
            { name: 'Laurent Protege', count: 3 },
            { name: 'Rivershaper', count: 3 },
            { name: 'Screeching Dragon', count: 3 },
            { name: 'Swiftwing Lancer', count: 2 },
            { name: 'Single Combat', count: 3 },
            { name: 'Sharpsight', count: 3 },
            { name: 'Riposte', count: 3 },
            { name: 'Deny', count: 2 },
            { name: 'Nopeify!', count: 2 },
            { name: 'Concerted Strike', count: 2 },
            { name: 'Golden Aegis', count: 2 }
        ]
    },
    {
        id: 'deck-discard-aggro',
        name: 'Discard Aggro',
        description: 'Discard cards to trigger powerful effects and level up Jinx.',
        regions: ['Piltover & Zaun', 'Noxus'],
        mainChampions: ['Jinx', 'Draven'],
        cards: [
            { name: 'Jinx', count: 3 },
            { name: 'Draven', count: 3 },
            { name: 'Zaunite Urchin', count: 3 },
            { name: 'Flame Chompers!', count: 3 },
            { name: 'Jury-Rig', count: 3 },
            { name: 'House Spider', count: 3 },
            { name: 'Boom Baboon', count: 3 },
            { name: 'Arena Battlecaster', count: 3 },
            { name: 'Crowd Favorite', count: 2 },
            { name: 'Poro Cannon', count: 3 },
            { name: 'Rummage', count: 3 },
            { name: 'Get Excited!', count: 3 },
            { name: 'Mystic Shot', count: 3 },
            { name: 'Augmented Experimenter', count: 2 }
        ]
    },
    {
        id: 'deck-ashe-sejuani',
        name: 'Ashe Sejuani Frostbite',
        description: 'Freeze enemies to prevent them from blocking and attacking.',
        regions: ['Freljord', 'Noxus'],
        mainChampions: ['Ashe', 'Sejuani'],
        cards: [
            { name: 'Ashe', count: 3 },
            { name: 'Sejuani', count: 3 },
            { name: 'Omen Hawk', count: 3 },
            { name: 'Icevale Archer', count: 3 },
            { name: 'Avarosan Sentry', count: 3 },
            { name: 'Trifarian Gloryseeker', count: 3 },
            { name: 'Avarosan Trapper', count: 3 },
            { name: 'Avarosan Hearthguard', count: 3 },
            { name: 'Trifarian Assessor', count: 3 },
            { name: 'Flash Freeze', count: 3 },
            { name: 'Brittle Steel', count: 2 },
            { name: 'Culling Strike', count: 3 },
            { name: 'Harsh Winds', count: 2 },
            { name: 'The Harrowing', count: 1 } // Odd tech choice, maybe Reckoning is better
        ]
    },
    {
        id: 'deck-ezreal-draven',
        name: 'Ezreal Draven Control',
        description: 'Control the board with spells and finish with Ezreal.',
        regions: ['Piltover & Zaun', 'Noxus'],
        mainChampions: ['Ezreal', 'Draven'],
        cards: [
            { name: 'Ezreal', count: 3 },
            { name: 'Draven', count: 3 },
            { name: 'House Spider', count: 3 },
            { name: 'Arachnoid Sentry', count: 3 },
            { name: 'Ravenous Flock', count: 3 },
            { name: 'Mystic Shot', count: 3 },
            { name: 'Thermogenic Beam', count: 3 },
            { name: 'Statikk Shock', count: 3 },
            { name: 'Scorched Earth', count: 2 },
            { name: 'Guillotine', count: 1 },
            { name: 'Tri-beam Improbulator', count: 3 },
            { name: 'Captain Farron', count: 2 },
            { name: 'Sump Dredger', count: 3 }
        ]
    },
    {
        id: 'deck-nasus-thresh',
        name: 'Nasus Thresh Slay',
        description: 'Slay your own units to grow Nasus and cheat him out with Thresh.',
        regions: ['Shurima', 'Shadow Isles'],
        mainChampions: ['Nasus', 'Thresh'],
        cards: [
            { name: 'Nasus', count: 3 },
            { name: 'Thresh', count: 3 },
            { name: 'Dunekeeper', count: 3 },
            { name: 'Baccai Reaper', count: 3 },
            { name: 'Cursed Keeper', count: 3 },
            { name: 'Ravenous Butcher', count: 3 },
            { name: 'Fading Icon', count: 3 },
            { name: 'Spirit Leech', count: 3 },
            { name: 'Rampaging Baccai', count: 2 },
            { name: 'Glimpse Beyond', count: 3 },
            { name: 'Rite of Negation', count: 2 },
            { name: 'Vengeance', count: 2 },
            { name: 'Atrocity', count: 2 },
            { name: 'Black Spear', count: 2 }
        ]
    },
    {
        id: 'deck-azir-irelia',
        name: 'Azir Irelia',
        description: 'Relentless attacks with Sand Soldiers and Blades.',
        regions: ['Shurima', 'Ionia'],
        mainChampions: ['Azir', 'Irelia'],
        cards: [
            { name: 'Azir', count: 3 },
            { name: 'Irelia', count: 3 },
            { name: 'Dunekeeper', count: 3 },
            { name: 'Sparring Student', count: 3 },
            { name: 'Greenglade Duo', count: 3 },
            { name: 'Ribbon Dancer', count: 3 },
            { name: 'Blossoming Blade', count: 3 },
            { name: 'Emperor\'s Dais', count: 3 },
            { name: 'Lead and Follow', count: 3 },
            { name: 'Recall', count: 2 },
            { name: 'Defiant Dance', count: 3 },
            { name: 'Flawless Duet', count: 2 }, // Token, check if maindeckable? Wait, Vanguard's Edge is the spell
            { name: 'Vanguard\'s Edge', count: 2 },
            { name: 'Shape of Stone', count: 3 }
        ]
    }
];

// Helper to hydrate decks
export const getHydratedStarterDecks = (): any[] => {
    return STARTER_DECKS.map(deck => {
        const hydratedCards: any[] = [];
        deck.cards.forEach(item => {
            const cardData = ALL_CARDS.find(c => c.name.toLowerCase() === item.name.toLowerCase());
            if (cardData) {
                // Determine foil/normal based on count? Nah, just normal
                hydratedCards.push({
                    card: cardData,
                    count: item.count
                });
            }
        });

        return {
            ...deck,
            coverImage: hydratedCards[0]?.card.image_url,
            totalCards: hydratedCards.reduce((acc, c) => acc + c.count, 0),
            items: hydratedCards
        };
    });
};
