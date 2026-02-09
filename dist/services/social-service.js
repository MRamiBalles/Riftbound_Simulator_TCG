"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialService = void 0;
class SocialService {
    static feed = [];
    static broadcastPull(userName, level, cards, packType) {
        const pull = {
            id: Math.random().toString(36).substr(2, 9),
            userName,
            userLevel: level,
            cards,
            timestamp: Date.now(),
            packType
        };
        this.feed = [pull, ...this.feed].slice(0, 50); // Keep last 50
    }
    static getFeed() {
        // If empty, generate some mock pulls for the "Social" feel
        if (this.feed.length === 0) {
            return this.generateMockFeed();
        }
        return this.feed;
    }
    static async getFriendEchoes() {
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
    static generateMockFeed() {
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
exports.SocialService = SocialService;
