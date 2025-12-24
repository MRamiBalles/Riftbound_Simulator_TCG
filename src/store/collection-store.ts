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
    removeCard: (cardId: string, source: CollectionSource) => void;
    getQuantity: (cardId: string, source?: CollectionSource) => number;

    // Helpers for UI
    getTotalCards: (source: CollectionSource) => number;

    // Showcase
    showcase: (string | null)[]; // 9 slots
    setShowcaseSlot: (index: number, cardId: string | null) => void;
}

export const useCollectionStore = create<CollectionState>()(
    persist(
        (set, get) => ({
            inventory: {},
            showcase: Array(9).fill(null), // Init 9 empty slots

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
                    const newInventory = { ...state.inventory };
                    cardIds.forEach(id => {
                        const existing = newInventory[id] || { virtual: 0, real: 0 };
                        newInventory[id] = {
                            ...existing,
                            [source.toLowerCase()]: existing[source.toLowerCase() as 'virtual' | 'real'] + 1
                        };
                    });
                    return { inventory: newInventory };
                });
            },

            removeCard: (cardId, source) => {
                set((state) => {
                    const newInventory = { ...state.inventory };
                    const existing = newInventory[cardId];
                    if (existing) {
                        const key = source.toLowerCase() as 'virtual' | 'real';
                        if (existing[key] > 0) {
                            newInventory[cardId] = {
                                ...existing,
                                [key]: existing[key] - 1
                            };
                        }
                    }
                    return { inventory: newInventory };
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
            },

            setShowcaseSlot: (index, cardId) => {
                set((state) => {
                    const newShowcase = [...state.showcase];
                    if (index >= 0 && index < 9) {
                        newShowcase[index] = cardId;
                    }
                    return { showcase: newShowcase };
                });
            }
        }),
        {
            name: 'riftbound-hybrid-collection',
        }
    )
);
