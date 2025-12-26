import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CardSkin = 'DEFAULT' | 'GOLD_BORDER' | 'PRISM' | 'VOID_STATIC';

interface CosmeticState {
    ownedSkins: Record<string, CardSkin[]>; // cardId -> list of skins
    equippedSkins: Record<string, CardSkin>; // cardId -> active skin

    // Actions
    unlockSkin: (cardId: string, skin: CardSkin) => void;
    equipSkin: (cardId: string, skin: CardSkin) => void;
}

export const useCosmeticStore = create<CosmeticState>()(
    persist(
        (set) => ({
            ownedSkins: {},
            equippedSkins: {},

            unlockSkin: (cardId, skin) => set(state => {
                const existing = state.ownedSkins[cardId] || ['DEFAULT'];
                if (existing.includes(skin)) return state;
                return {
                    ownedSkins: {
                        ...state.ownedSkins,
                        [cardId]: [...existing, skin]
                    }
                };
            }),

            equipSkin: (cardId, skin) => set(state => ({
                equippedSkins: {
                    ...state.equippedSkins,
                    [cardId]: skin
                }
            }))
        }),
        {
            name: 'riftbound-cosmetic-storage'
        }
    )
);
