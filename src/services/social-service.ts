import { Card } from '@/lib/database.types';
import { MOCK_CARDS } from '@/services/card-service';

export interface FriendActivity {
    id: string;
    username: string;
    avatarUrl: string;
    timeAgo: string;
    packResult: Card[]; // The 5 cards they opened
}

const MOCK_USERS = [
    { name: 'Faker', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/588.png' },
    { name: 'JinxMain01', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/3587.png' },
    { name: 'Tyler1', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/6.png' },
    { name: 'RiotPhreak', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/3516.png' },
    { name: 'ArcaneFan', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5316.png' },
];

export const getFriendEchoes = async (): Promise<FriendActivity[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return MOCK_USERS.map((user, idx) => {
        // Generate a random pack for each friend
        const pack: Card[] = [];
        for (let i = 0; i < 5; i++) {
            const random = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
            pack.push({ ...random });
        }

        return {
            id: `echo-${idx}`,
            username: user.name,
            avatarUrl: user.avatar,
            timeAgo: `${Math.floor(Math.random() * 59) + 1}m ago`,
            packResult: pack
        };
    });
};
