import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    cardLegacies: Record<string, { wins: number; games: number; kills: number }>;
    userId: string; // The "Rift ID"
    lastSyncTime: number | null;
    prestigePoints: number;
    pityCounter: number;

    // Actions
    updateCardLegacy: (cardId: string, stats: { win?: boolean; kill?: boolean }) => void;
    setLastSyncTime: (time: number) => void;
    linkAccount: (newId: string) => void;
    loadFullState: (state: Partial<UserState>) => void;
    addPrestigePoints: (points: number) => void;
    registerPackOpening: (rareFound: boolean, count: number, finalPity: number) => void;
    consumeEnergy: (amount: number) => boolean; // Keep as stub for compatibility or remove
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            cardLegacies: {},
            userId: 'RIFT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            lastSyncTime: null,
            prestigePoints: 1250, // Starter points
            pityCounter: 0,

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

            setLastSyncTime: (time) => set({ lastSyncTime: time }),

            linkAccount: (newId) => set({ userId: newId }),

            loadFullState: (newState) => set(state => ({ ...state, ...newState })),

            addPrestigePoints: (points) => set(state => ({ prestigePoints: state.prestigePoints + points })),

            registerPackOpening: (rareFound, count, finalPity) => set(state => ({
                pityCounter: finalPity
            })),

            consumeEnergy: (amount) => {
                // Return true as we've removed energy mechanics for Gold Master
                return true;
            },
        }),
        {
            name: 'riftbound-user-storage'
        }
    )
);
