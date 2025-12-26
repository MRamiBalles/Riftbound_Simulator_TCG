'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_CARDS } from '@/services/card-service';
import { useCollectionStore } from '@/store/collection-store';
import { Card as CardComponent } from '@/components/Card';
import { Search, AlertTriangle, CheckCircle, Copy, Save } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { ManaCurveChart } from '@/components/deck-builder/ManaCurveChart';

export default function DeckBuilderPage() {
    const router = useRouter();
    const { inventory, setActiveDeck } = useCollectionStore();
    const [deck, setDeck] = useState<Record<string, number>>({});
    const [search, setSearch] = useState('');
    const [selectedSet, setSelectedSet] = useState<string>('all');
    const [selectedRarity, setSelectedRarity] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    // Filter cards for library
    const library = useMemo(() => {
        return MOCK_CARDS.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
            const matchesSet = selectedSet === 'all' || (c as any).set_name === selectedSet || (c as any).set_code === selectedSet;
            const matchesRarity = selectedRarity === 'all' || c.rarity === selectedRarity;
            const matchesType = selectedType === 'all' || c.type === selectedType;
            return matchesSearch && matchesSet && matchesRarity && matchesType;
        }).slice(0, 100); // Limit to 100 for performance
    }, [search, selectedSet, selectedRarity, selectedType]);

    const deckSize = Object.values(deck).reduce((a, b) => a + b, 0);

    // Add card to deck (max 3 copies)
    const addCard = (cardId: string) => {
        if (deckSize >= 40) return;
        setDeck(prev => ({
            ...prev,
            [cardId]: Math.min((prev[cardId] || 0) + 1, 3)
        }));
    };

    // Remove card from deck
    const removeCard = (cardId: string) => {
        setDeck(prev => {
            const count = prev[cardId];
            if (!count) return prev;
            if (count === 1) {
                const { [cardId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [cardId]: count - 1 };
        });
    };

    // Validate Deck against Inventory
    const validationIssues = Object.entries(deck).map(([cardId, requiredCount]) => {
        const owned = inventory[cardId];
        const totalOwned = (owned?.virtual || 0) + (owned?.real || 0);
        if (totalOwned < requiredCount) {
            return { cardId, missing: requiredCount - totalOwned };
        }
        return null;
    }).filter(Boolean);

    const isValid = deckSize === 40 && validationIssues.length === 0;

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif flex flex-col pt-20">
            <EnergyWidget />

            {/* Header */}
            <header className="bg-[#091428] border-b border-[#7a5c29] p-4 flex justify-between items-center shadow-lg z-20">
                <div className="flex items-center gap-4">
                    <Link href="/decks" className="text-[#a09b8c] hover:text-[#f0e6d2]">‹ Exit</Link>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c8aa6e] to-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>
                        NEW DECK ({deckSize}/40)
                    </h1>
                </div>

                <div className="flex gap-4">
                    <div className={clsx(
                        "flex items-center gap-2 px-4 py-1 rounded-full border text-sm",
                        isValid ? "border-[#0ac8b9] text-[#0ac8b9] bg-[#0ac8b9]/10" : "border-red-500 text-red-500 bg-red-900/20"
                    )}>
                        {isValid ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {isValid ? "READY TO PLAY" : "INCOMPLETE"}
                    </div>
                    {/* Play Button */}
                    <button
                        onClick={() => {
                            // Expand deck to list of IDs
                            const deckList: string[] = [];
                            Object.entries(deck).forEach(([id, count]) => {
                                for (let i = 0; i < count; i++) deckList.push(id);
                            });
                            setActiveDeck(deckList);
                            router.push('/play');
                        }}
                        disabled={!isValid && deckSize === 0} // Allow testing incomplete decks
                        className={clsx(
                            "btn-hextech px-6 py-1 text-xs flex items-center gap-2 font-bold",
                            isValid ? "text-[#0ac8b9] border-[#0ac8b9]" : "opacity-50 grayscale"
                        )}
                    >
                        <Save className="w-4 h-4" /> PLAY DECK
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: LIBRARY */}
                <div className="flex-1 flex flex-col border-r border-[#7a5c29]/30 bg-[#010a13]/50 backdrop-blur">
                    <div className="p-4 border-b border-[#7a5c29]/30 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09b8c]" />
                            <input
                                type="text"
                                placeholder="Search cards..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#1e2328] border border-[#7a5c29] rounded-full py-2 pl-10 pr-4 text-sm text-[#f0e6d2] focus:outline-none focus:border-[#c8aa6e]"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                value={selectedSet}
                                onChange={(e) => setSelectedSet(e.target.value)}
                                className="bg-[#1e2328] border border-[#7a5c29] text-xs text-[#a09b8c] rounded px-2 py-1 outline-none focus:border-[#c8aa6e]"
                            >
                                <option value="all">All Sets</option>
                                <option value="Origins">Origins</option>
                                <option value="Spiritforged">Spiritforged</option>
                                <option value="Proving Grounds">Proving Grounds</option>
                            </select>

                            <select
                                value={selectedRarity}
                                onChange={(e) => setSelectedRarity(e.target.value)}
                                className="bg-[#1e2328] border border-[#7a5c29] text-xs text-[#a09b8c] rounded px-2 py-1 outline-none focus:border-[#c8aa6e]"
                            >
                                <option value="all">All Rarities</option>
                                <option value="Common">Common</option>
                                <option value="Rare">Rare</option>
                                <option value="Epic">Epic</option>
                                <option value="Champion">Champion</option>
                            </select>

                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="bg-[#1e2328] border border-[#7a5c29] text-xs text-[#a09b8c] rounded px-2 py-1 outline-none focus:border-[#c8aa6e]"
                            >
                                <option value="all">All Types</option>
                                <option value="Unit">Unit</option>
                                <option value="Spell">Spell</option>
                                <option value="Gear">Gear</option>
                                <option value="Battlefield">Battlefield</option>
                            </select>

                            <button
                                onClick={() => { setSearch(''); setSelectedSet('all'); setSelectedRarity('all'); setSelectedType('all'); }}
                                className="text-[10px] uppercase font-bold text-[#c8aa6e] hover:text-[#f0e6d2] transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
                        {library.map(card => {
                            const owned = inventory[card.id];
                            const totalOwned = (owned?.virtual || 0) + (owned?.real || 0);
                            const inDeck = deck[card.id] || 0;

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => addCard(card.id)}
                                    className="relative group cursor-pointer hover:scale-[1.02] transition-transform"
                                >
                                    <CardComponent card={card} />
                                    {/* Inventory Badge */}
                                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] border border-[#7a5c29]">
                                        x{totalOwned} Owned
                                    </div>
                                    {/* In Deck Badge */}
                                    {inDeck > 0 && (
                                        <div className="absolute inset-0 bg-[#0ac8b9]/20 border-2 border-[#0ac8b9] rounded-xl flex items-center justify-center pointer-events-none">
                                            <span className="text-4xl font-bold text-white drop-shadow-md">x{inDeck}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: DECK LIST */}
                <div className="w-80 md:w-96 bg-[#091428] flex flex-col border-l border-[#c8aa6e]/30 shadow-2xl">
                    <div className="p-4 bg-[#1e2328] border-b border-[#c8aa6e]/30">
                        <h2 className="text-[#c8aa6e] font-bold uppercase tracking-widest text-sm">Deck Contents</h2>
                    </div>

                    <div className="px-4 py-2 bg-black/20">
                        <ManaCurveChart deck={deck} cards={MOCK_CARDS} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {Object.entries(deck).length === 0 ? (
                            <div className="text-center text-[#a09b8c] mt-10 italic">
                                Use the library to add cards.
                            </div>
                        ) : Object.entries(deck).map(([cardId, count]) => {
                            const card = MOCK_CARDS.find(c => c.id === cardId)!;
                            const owned = inventory[cardId];
                            const totalOwned = (owned?.virtual || 0) + (owned?.real || 0);
                            const missing = Math.max(0, count - totalOwned);

                            return (
                                <div
                                    key={cardId}
                                    className={clsx(
                                        "flex items-center gap-3 p-2 rounded border bg-[#010a13]/50",
                                        missing > 0 ? "border-red-500/50" : "border-[#7a5c29]/30"
                                    )}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full bg-cover bg-center border border-[#c8aa6e]"
                                        style={{ backgroundImage: `url(${card.image_url})` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate text-sm">{card.name}</div>
                                        <div className="text-xs text-[#a09b8c]">{card.cost} Mana</div>
                                    </div>

                                    {missing > 0 && (
                                        <div className="text-red-400 text-[10px] font-bold uppercase px-1 border border-red-500 rounded">
                                            Missing x{missing}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 bg-[#1e2328] rounded border border-[#7a5c29]/50">
                                        <button onClick={() => removeCard(cardId)} className="px-2 hover:bg-[#c8aa6e] hover:text-black">-</button>
                                        <span className="w-4 text-center text-sm font-bold">{count}</span>
                                        <button onClick={() => addCard(cardId)} className="px-2 hover:bg-[#c8aa6e] hover:text-black">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Footer */}
                    <div className="p-4 bg-[#1e2328] border-t border-[#c8aa6e]/30 space-y-2">
                        <div className="flex justify-between text-xs text-[#a09b8c]">
                            <span>Champions</span>
                            <span>{Object.entries(deck).filter(([id]) => MOCK_CARDS.find(c => c.id === id)?.rarity === 'Champion').reduce((a, [_, c]) => a + c, 0)}/6</span>
                        </div>
                        <div className="h-1 w-full bg-[#010a13] rounded-full overflow-hidden">
                            <div className="h-full bg-[#c8aa6e]" style={{ width: `${(deckSize / 40) * 100}%` }} />
                        </div>
                        <button className="w-full btn-hextech mt-2 flex items-center justify-center gap-2">
                            <Copy className="w-3 h-3" /> Copy Deck Code
                        </button>
                    </div>
                </div>
            </div>
        </main >
    );
}
