import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    scanCredits: number;
    isPremium: boolean;
    totalScansPerformed: number;
    lastAdView: number | null;
    wonderShards: number;
    starDust: number;
    cardLegacies: Record<string, { wins: number; games: number; kills: number }>;
    lastPackOpened: number | null;
    packHourglasses: number;
    pityCounter: number;
    boosterEnergy: number; // 0 to 24 (12 per pack)
    lastEnergyUpdate: number;
    prestigePoints: number; // Total points earned (Loyalty)
    narrativeProgress: Record<string, boolean>; // Completed story nodes
    activeChronicle: string | null;
    userId: string; // The "Rift ID"
    lastSyncTime: number | null;

    // Actions
    useScanCredit: () => boolean;
    refillCredits: (amount: number) => void;
    upgradeToPremium: () => void;
    watchAd: () => Promise<void>;
    addWonderShards: (amount: number) => void;
    addStarDust: (amount: number) => void;
    updateCardLegacy: (cardId: string, stats: { win?: boolean; kill?: boolean }) => void;
    addPackHourglasses: (amount: number) => void;
    registerPackOpening: (hasRare: boolean, count?: number, forcedPity?: number) => void;
    consumeEnergy: (amount: number) => boolean;
    getRefreshedEnergy: () => number;
    useHourglass: () => void;
    addPrestigePoints: (amount: number) => void;
    completeChronicleNode: (nodeId: string) => void;
    setLastSyncTime: (time: number) => void;
    linkAccount: (newId: string) => void;
    loadFullState: (state: Partial<UserState>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            scanCredits: 5,
            isPremium: false,
            totalScansPerformed: 0,
            lastAdView: null,
            wonderShards: 3,
            starDust: 0,
            cardLegacies: {},
            lastPackOpened: null,
            packHourglasses: 3,
            pityCounter: 0,
            boosterEnergy: 12,
            lastEnergyUpdate: Date.now(),
            prestigePoints: 0,
            narrativeProgress: {},
            activeChronicle: 'GENESIS_FLAME',
            userId: 'RIFT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            lastSyncTime: null,

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

            addStarDust: (amount: number) => set(state => ({ starDust: state.starDust + amount })),

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

            registerPackOpening: (hasRare, count = 1, forcedPity) => set(state => {
                const lastPackOpened = Date.now();

                if (forcedPity !== undefined) {
                    return { lastPackOpened, pityCounter: forcedPity };
                }

                if (hasRare) {
                    return { lastPackOpened, pityCounter: 0 };
                }

                return {
                    lastPackOpened,
                    pityCounter: state.pityCounter + count
                };
            }),

            addPrestigePoints: (amount) => set(state => ({ prestigePoints: state.prestigePoints + amount })),

            completeChronicleNode: (nodeId) => set(state => ({
                narrativeProgress: { ...state.narrativeProgress, [nodeId]: true }
            })),

            setLastSyncTime: (time) => set({ lastSyncTime: time }),

            linkAccount: (newId) => set({ userId: newId }),

            loadFullState: (newState) => set(state => ({ ...state, ...newState })),
        }),
        {
            name: 'riftbound-user-storage'
        }
    )
);
