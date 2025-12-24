import { Card } from '@/lib/database.types';
import { MOCK_CARDS } from '@/services/card-service';

export type ActivityType = 'PACK' | 'DECK' | 'TRADE';

interface BaseActivity {
    id: string;
    username: string;
    avatarUrl: string;
    timeAgo: string;
    type: ActivityType;
}

export interface PackActivity extends BaseActivity {
    type: 'PACK';
    packResult: Card[];
}

export interface DeckActivity extends BaseActivity {
    type: 'DECK';
    deckName: string;
    regions: string[];
    mainChampion: string;
}

export interface TradeActivity extends BaseActivity {
    type: 'TRADE';
    cardName: string;
    price: number;
    action: 'BOUGHT' | 'SOLD';
}

export type FriendActivity = PackActivity | DeckActivity | TradeActivity;

const MOCK_USERS = [
    { name: 'Faker', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/588.png' },
    { name: 'JinxMain01', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/3587.png' },
    { name: 'Tyler1', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/6.png' },
    { name: 'RiotPhreak', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/3516.png' },
    { name: 'ArcaneFan', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5316.png' },
    { name: 'K3Soju', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/4660.png' },
];

export const getFriendEchoes = async (): Promise<FriendActivity[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return Array.from({ length: 10 }).map((_, idx) => {
        const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        const typeRoll = Math.random();

        const base = {
            id: `echo-${idx}`,
            username: user.name,
            avatarUrl: user.avatar,
            timeAgo: `${Math.floor(Math.random() * 59) + 1}m ago`,
        };

        if (typeRoll > 0.6) {
            // PACK 
            const pack: Card[] = [];
            for (let i = 0; i < 5; i++) {
                const random = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
                if (random) pack.push({ ...random });
            }
            return { ...base, type: 'PACK', packResult: pack } as PackActivity;
        } else if (typeRoll > 0.3) {
            // DECK
            const decks = ['Jinx Burn', 'Demacia Midrange', 'Ionia Control', 'Noxus Aggro', 'Shurima Movies'];
            return {
                ...base,
                type: 'DECK',
                deckName: decks[Math.floor(Math.random() * decks.length)],
                regions: ['Noxus', 'Piltover & Zaun'], // Mock for now
                mainChampion: 'Jinx Demolitionist'
            } as DeckActivity;
        } else {
            // TRADE
            const card = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
            return {
                ...base,
                type: 'TRADE',
                cardName: card?.name || 'Unknown Card',
                price: (card?.market_price || 15) * (1 + (Math.random() * 0.2)),
                action: Math.random() > 0.5 ? 'BOUGHT' : 'SOLD'
            } as TradeActivity;
        }
    });
};

