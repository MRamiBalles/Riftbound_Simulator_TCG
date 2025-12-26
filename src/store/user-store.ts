import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    scanCredits: number;
    isPremium: boolean;
    totalScansPerformed: number;
    lastAdView: number | null;
    wonderShards: number;
    cardLegacies: Record<string, { wins: number; games: number; kills: number }>;
    lastPackOpened: number | null;
    packHourglasses: number;
    pityCounter: number;
    boosterEnergy: number; // 0 to 24 (12 per pack)
    lastEnergyUpdate: number;

    // Actions
    useScanCredit: () => boolean;
    refillCredits: (amount: number) => void;
    upgradeToPremium: () => void;
    watchAd: () => Promise<void>;
    addWonderShards: (amount: number) => void;
    updateCardLegacy: (cardId: string, stats: { win?: boolean; kill?: boolean }) => void;
    addPackHourglasses: (amount: number) => void;
    registerPackOpening: (hasRare: boolean, count?: number) => void;
    consumeEnergy: (amount: number) => boolean;
    getRefreshedEnergy: () => number;
    useHourglass: () => void;
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
            lastPackOpened: null,
            packHourglasses: 3,
            pityCounter: 0,
            boosterEnergy: 12,
            lastEnergyUpdate: Date.now(),

            getRefreshedEnergy: () => {
                const { boosterEnergy, lastEnergyUpdate } = get();
                const now = Date.now();
                const elapsed = now - lastEnergyUpdate;
                const earned = Math.floor(elapsed / (3600000)); // 1 per hour

                if (earned > 0) {
                    return Math.min(24, boosterEnergy + earned);
                }
                return boosterEnergy;
            },

            consumeEnergy: (amount) => {
                const current = get().getRefreshedEnergy();
                if (current >= amount) {
                    set({
                        boosterEnergy: current - amount,
                        lastEnergyUpdate: Date.now()
                    });
                    return true;
                }
                return false;
            },

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
            }),

            addPackHourglasses: (amount) => set(state => ({ packHourglasses: state.packHourglasses + amount })),

            useHourglass: () => set(state => {
                if (state.packHourglasses > 0) {
                    return {
                        packHourglasses: state.packHourglasses - 1,
                        boosterEnergy: Math.min(24, state.boosterEnergy + 1)
                    };
                }
                return state;
            }),

            registerPackOpening: (hasRare, count = 1) => set(state => ({
                lastPackOpened: Date.now(),
                pityCounter: hasRare ? 0 : state.pityCounter + count
            }))
        }),
        {
            name: 'riftbound-user-storage'
        }
    )
);
