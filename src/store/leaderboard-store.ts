import { create } from 'zustand';

export type Tier = 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'CHALLENGER';

export interface PlayerRank {
    rank: number;
    username: string;
    mmr: number;
    tier: Tier;
    winRate: number;
}

interface LeaderboardState {
    topPlayers: PlayerRank[];
    userRank: PlayerRank | null;

    // Actions
    updateMMR: (delta: number) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
    topPlayers: [
        { rank: 1, username: 'Antigravity_AI', mmr: 3200, tier: 'CHALLENGER', winRate: 98.2 },
        { rank: 2, username: 'ShadowBlade', mmr: 3050, tier: 'CHALLENGER', winRate: 64.1 },
        { rank: 3, username: 'HextechKing', mmr: 2980, tier: 'MASTER', winRate: 61.5 },
        { rank: 4, username: 'RiftWalker', mmr: 2890, tier: 'MASTER', winRate: 59.8 },
        { rank: 5, username: 'ManaAddict', mmr: 2750, tier: 'DIAMOND', winRate: 58.2 },
    ],
    userRank: {
        rank: 1250,
        username: 'User_442',
        mmr: 1200,
        tier: 'SILVER',
        winRate: 51.0
    },

    updateMMR: (delta) => set(state => {
        if (!state.userRank) return state;
        const newMMR = state.userRank.mmr + delta;
        // Simple tier calculation logic
        let newTier: Tier = 'SILVER' as Tier;
        if (newMMR > 2000) newTier = 'DIAMOND';
        else if (newMMR > 1500) newTier = 'GOLD';

        return {
            userRank: { ...state.userRank, mmr: newMMR, tier: newTier }
        };
    })
}));
