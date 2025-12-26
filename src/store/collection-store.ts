import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '@/lib/database.types';

export type CollectionSource = 'REAL' | 'VIRTUAL';

interface CollectionEntry {
    virtual: number;
    real: number;
}

interface Deck {
    id: string;
    name: string;
    cards: string[]; // Array of card IDs
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

    // Deck Play
    activeDeck: string[] | null;
    setActiveDeck: (deck: string[]) => void;

    // New deck management
    decks: Deck[];
    addDeck: (deck: Omit<Deck, 'id'>) => void;
    updateDeck: (id: string, cards: string[]) => void;
    deleteDeck: (id: string) => void;
}

/**
 * Store for managing the user's card collection and custom decks.
 * Includes persistence to LocalStorage for a consistent experience across sessions.
 */
export const useCollectionStore = create<CollectionState>()(
    persist(
        (set, get) => ({
            inventory: {},
            showcase: Array(9).fill(null), // Init 9 empty slots
            activeDeck: null,
            decks: [], // Initialize decks array

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
            },

            activeDeck: null,
            setActiveDeck: (deck) => set({ activeDeck: deck }),

            decks: [],
            addDeck: (deck) => set((state) => ({
                decks: [...state.decks, { ...deck, id: Math.random().toString(36).substr(2, 9) }]
            })),
            updateDeck: (id, cards) => set((state) => ({
                decks: state.decks.map((d) => (d.id === id ? { ...d, cards } : d))
            })),
            deleteDeck: (id) => set((state) => ({
                decks: state.decks.filter((d) => d.id !== id)
            })),
        }),
        {
            name: 'riftbound-hybrid-collection',
        }
    )
);
