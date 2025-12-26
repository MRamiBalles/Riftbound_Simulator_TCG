import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PassTier {
    level: number;
    freeReward: { type: 'SHARDS' | 'ENERGY' | 'DUST' | 'PACK', amount: number, packType?: string };
    premiumReward?: { type: 'SLEEVE' | 'PACK' | 'DUST', amount: number, id?: string };
}

interface RiftPassState {
    xp: number;
    level: number;
    isPremium: boolean;
    claimedFree: number[]; // Array of levels
    claimedPremium: number[];

    // Actions
    addXp: (amount: number) => void;
    claimTier: (level: number, type: 'FREE' | 'PREMIUM') => void;
    buyPremium: () => void;
}

export const useRiftPassStore = create<RiftPassState>()(
    persist(
        (set) => ({
            xp: 0,
            level: 1,
            isPremium: false,
            claimedFree: [],
            claimedPremium: [],

            addXp: (amount) => set(state => {
                const totalXp = state.xp + amount;
                const newLevel = Math.floor(totalXp / 1000) + 1;
                return { xp: totalXp, level: Math.min(50, newLevel) };
            }),

            claimTier: (level, type) => set(state => {
                if (type === 'FREE') {
                    return { claimedFree: [...state.claimedFree, level] };
                }
                return { claimedPremium: [...state.claimedPremium, level] };
            }),

            buyPremium: () => set({ isPremium: true })
        }),
        {
            name: 'riftbound-pass-storage'
        }
    )
);
