import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CollectionSource = 'REAL' | 'VIRTUAL';

interface CollectionEntry {
    virtual: number;
    real: number;
}

interface CollectionState {
    // Map of Card ID -> Counts
    inventory: Record<string, CollectionEntry>;

    addCard: (cardId: string, source: CollectionSource) => void;
    addCards: (cardIds: string[], source: CollectionSource) => void;
    getQuantity: (cardId: string, source?: CollectionSource) => number;

    // Helpers for UI
    getTotalCards: (source: CollectionSource) => number;
}

export const useCollectionStore = create<CollectionState>()(
    persist(
        (set, get) => ({
            inventory: {},

            addCard: (cardId, source) => {
                set((state) => {
                    const inv = { ...state.inventory };
                    if (!inv[cardId]) {
                        inv[cardId] = { virtual: 0, real: 0 };
                    }

                    if (source === 'VIRTUAL') inv[cardId].virtual++;
                    else inv[cardId].real++;

                    return { inventory: inv };
                });
            },

            addCards: (cardIds, source) => {
                set((state) => {
                    const inv = { ...state.inventory };
                    cardIds.forEach(id => {
                        if (!inv[id]) inv[id] = { virtual: 0, real: 0 };

                        if (source === 'VIRTUAL') inv[id].virtual++;
                        else inv[id].real++;
                    });
                    return { inventory: inv };
                });
            },

            getQuantity: (cardId, source) => {
                const item = get().inventory[cardId];
                if (!item) return 0;
                if (source === 'VIRTUAL') return item.virtual;
                if (source === 'REAL') return item.real;
                return item.virtual + item.real;
            },

            getTotalCards: (source) => {
                const { inventory } = get();
                return Object.values(inventory).reduce((acc, item) => {
                    return acc + (source === 'VIRTUAL' ? item.virtual : item.real);
                }, 0);
            }
        }),
        {
            name: 'riftbound-hybrid-collection',
        }
    )
);
