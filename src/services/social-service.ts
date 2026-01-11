import { Card } from '@/lib/database.types';

export interface PublicPull {
    id: string;
    userName: string;
    userLevel: number;
    cards: Card[];
    timestamp: number;
    packType: 'alpha' | 'omega' | 'void';
}

export interface FriendActivity {
    id: string;
    username: string;
    avatarUrl: string;
    type: 'PACK' | 'DECK' | 'TRADE';
    timeAgo: string;
    packResult: Card[];
}

export class SocialService {
    private static feed: PublicPull[] = [];

    public static broadcastPull(userName: string, level: number, cards: Card[], packType: 'alpha' | 'omega' | 'void'): void {
        const pull: PublicPull = {
            id: Math.random().toString(36).substr(2, 9),
            userName,
            userLevel: level,
            cards,
            timestamp: Date.now(),
            packType
        };
        this.feed = [pull, ...this.feed].slice(0, 50); // Keep last 50
    }

    public static getFeed(): PublicPull[] {
        // If empty, generate some mock pulls for the "Social" feel
        if (this.feed.length === 0) {
            return this.generateMockFeed();
        }
        return this.feed;
    }

    public static async getFriendEchoes(): Promise<FriendActivity[]> {
        // Mock friend activity for the Echo feature
        return [
            {
                id: 'echo1',
                username: 'Nova_Stellar',
                avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/588.png',
                type: 'PACK',
                timeAgo: '5m ago',
                packResult: [] // Will be populated in the component if needed or kept empty for mock
            },
            {
                id: 'echo2',
                username: 'VoidWalker',
                avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/590.png',
                type: 'DECK',
                timeAgo: '12m ago',
                packResult: []
            }
        ];
    }

    private static generateMockFeed(): PublicPull[] {
        return [
            {
                id: 'mock1',
                userName: 'Nova_Stellar',
                userLevel: 42,
                cards: [], // In a real app, we'd have full card data here
                timestamp: Date.now() - 300000,
                packType: 'alpha'
            },
            {
                id: 'mock2',
                userName: 'VoidWalker',
                userLevel: 88,
                cards: [],
                timestamp: Date.now() - 900000,
                packType: 'void'
            }
        ];
    }
}
