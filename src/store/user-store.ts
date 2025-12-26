import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    scanCredits: number;
    isPremium: boolean;
    totalScansPerformed: number;
    lastAdView: number | null;
    wonderShards: number;
    cardLegacies: Record<string, { wins: number; games: number; kills: number }>;

    // Actions
    useScanCredit: () => boolean;
    refillCredits: (amount: number) => void;
    upgradeToPremium: () => void;
    watchAd: () => Promise<void>;
    addWonderShards: (amount: number) => void;
    updateCardLegacy: (cardId: string, stats: { win?: boolean; kill?: boolean }) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            scanCredits: 5,
            isPremium: false,
            totalScansPerformed: 0,
            lastAdView: null,
            wonderShards: 3,
            cardLegacies: {},

            useScanCredit: () => {
                const { scanCredits, isPremium } = get();
                if (isPremium) {
                    set(state => ({ totalScansPerformed: state.totalScansPerformed + 1 }));
                    return true;
                }
                if (scanCredits > 0) {
                    set(state => ({
                        scanCredits: state.scanCredits - 1,
                        totalScansPerformed: state.totalScansPerformed + 1
                    }));
                    return true;
                }
                return false;
            },

            refillCredits: (amount) => set(state => ({ scanCredits: state.scanCredits + amount })),

            upgradeToPremium: () => set({ isPremium: true, scanCredits: 9999 }),

            watchAd: async () => {
                await new Promise(r => setTimeout(r, 3000));
                set(state => ({
                    scanCredits: state.scanCredits + 10,
                    lastAdView: Date.now()
                }));
            },

            addWonderShards: (amount) => set(state => ({ wonderShards: state.wonderShards + amount })),

            updateCardLegacy: (cardId, stats) => set(state => {
                const legacy = state.cardLegacies[cardId] || { wins: 0, games: 0, kills: 0 };
                return {
                    cardLegacies: {
                        ...state.cardLegacies,
                        [cardId]: {
                            wins: legacy.wins + (stats.win ? 1 : 0),
                            games: legacy.games + 1,
                            kills: legacy.kills + (stats.kill ? 1 : 0)
                        }
                    }
                };
            })
        }),
        {
            name: 'riftbound-user-storage'
        }
    )
);
