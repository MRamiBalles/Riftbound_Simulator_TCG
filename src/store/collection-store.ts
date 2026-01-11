import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CloudService } from '@/services/cloud-service';

interface Deck {
    id: string;
    name: string;
    cards: string[]; // Array of card IDs
}

interface CollectionState {
    // Map of Card ID -> Quantity (Real Collection)
    inventory: Record<string, number>;

    addCard: (cardId: string, quantity?: number) => void;
    addCards: (cardIds: string[]) => void;
    removeCard: (cardId: string) => void;
    getQuantity: (cardId: string) => number;

    // Helpers for UI
    getTotalCards: () => number;

    // Showcase
    showcase: (string | null)[]; // 9 slots
    setShowcaseSlot: (index: number, cardId: string | null) => void;

    // Filter & Search State
    filters: {
        rarity: string | null;
        cost: number | null;
        type: string | null;
        set: string | null;
    };
    searchQuery: string;

    setFilter: (key: keyof CollectionState['filters'], value: any) => void;
    setSearchQuery: (query: string) => void;
    resetFilters: () => void;

    // Deck Play
    activeDeck: string[] | null;
    setActiveDeck: (deck: string[]) => void;

    // Deck management
    decks: Deck[];
    addDeck: (deck: Omit<Deck, 'id'>) => void;
    updateDeck: (id: string, cards: string[]) => void;
    deleteDeck: (id: string) => void;
}

/**
 * Store for managing the user's REAL card collection and custom decks.
 * Virtual/Gacha systems have been removed to focus on Marketplace and persistent assets.
 */
export const useCollectionStore = create<CollectionState>()(
    persist(
        (set, get) => ({
            inventory: {},
            showcase: Array(9).fill(null),
            filters: {
                rarity: null,
                cost: null,
                type: null,
                set: null,
            },
            searchQuery: '',

            setFilter: (key: keyof CollectionState['filters'], value: any) => {
                set((state: CollectionState) => ({
                    filters: { ...state.filters, [key]: value }
                }));
            },

            setSearchQuery: (query: string) => set({ searchQuery: query }),

            resetFilters: () => set({
                filters: { rarity: null, cost: null, type: null, set: null },
                searchQuery: ''
            }),

            addCard: (cardId: string, quantity = 1) => {
                set((state: CollectionState) => {
                    const inv = { ...state.inventory };
                    inv[cardId] = (inv[cardId] || 0) + quantity;
                    return { inventory: inv };
                });
            },

            addCards: (cardIds: string[]) => {
                set((state: CollectionState) => {
                    const newInventory = { ...state.inventory };
                    cardIds.forEach((id: string) => {
                        newInventory[id] = (newInventory[id] || 0) + 1;
                    });
                    return { inventory: newInventory };
                });
            },

            removeCard: (cardId: string) => {
                set((state: CollectionState) => {
                    const newInventory = { ...state.inventory };
                    if (newInventory[cardId] > 0) {
                        newInventory[cardId]--;
                    }
                    return { inventory: newInventory };
                });
            },

            getQuantity: (cardId) => {
                return get().inventory[cardId] || 0;
            },

            getTotalCards: () => {
                const { inventory } = get();
                return Object.values(inventory).reduce((acc, qty) => acc + qty, 0);
            },

            setShowcaseSlot: (index: number, cardId: string | null) => {
                set((state: CollectionState) => {
                    const newShowcase = [...state.showcase];
                    if (index >= 0 && index < 9) {
                        newShowcase[index] = cardId;
                    }

                    // Cloud Sync
                    CloudService.saveDeck('local-user', {
                        showcase: newShowcase
                    }).catch((e: any) => console.warn('[Showcase] Cloud sync deferred.', e));

                    return { showcase: newShowcase };
                });
            },

            activeDeck: null as string[] | null,
            setActiveDeck: (deck: string[]) => set({ activeDeck: deck }),

            decks: [] as Deck[],
            addDeck: (deck: Omit<Deck, 'id'>) => set((state) => ({
                decks: [...state.decks, { ...deck, id: Math.random().toString(36).substr(2, 9) }]
            })),
            updateDeck: (id: string, cards: string[]) => set((state) => ({
                decks: state.decks.map((d) => (d.id === id ? { ...d, cards } : d))
            })),
            deleteDeck: (id: string) => set((state) => ({
                decks: state.decks.filter((d) => d.id !== id)
            })),
        }),
        {
            name: 'riftbound-real-collection',
        }
    )
);
