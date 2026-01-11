'use client';

import React, { useState } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { MOCK_CARDS } from '@/services/card-service';
import { Card as CardComponent } from '@/components/Card';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import Link from 'next/link';
import { Plus, X, Search, Lock } from 'lucide-react';
import clsx from 'clsx';
import { Card } from '@/lib/database.types';

export default function ShowcasePage() {
    const { showcase, setShowcaseSlot, inventory } = useCollectionStore();
    const [editingSlot, setEditingSlot] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter available cards for selection (must own at least 1)
    const availableCards = MOCK_CARDS.filter(card => {
        const owned = inventory[card.id] || 0;
        const isOwned = owned > 0;
        // Also respect search
        const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
        return isOwned && matchesSearch;
    });

    const handleSelectCard = (card: Card) => {
        if (editingSlot !== null) {
            setShowcaseSlot(editingSlot, card.id);
            setEditingSlot(null);
        }
    };

    const handleClearSlot = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setShowcaseSlot(index, null);
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif p-4 md:p-8 pt-24 relative overflow-hidden">
            <HextechNavbar />
            <HextechSidebar />

            {/* Header */}
            <div className="max-w-4xl mx-auto flex flex-col items-center mb-12 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e]" style={{ fontFamily: 'Beaufort' }}>
                    SHOWCASE BINDER
                </h1>
                <p className="mt-2 text-[#a09b8c] text-center">
                    Curate your 9 most prized possessions for the world to see.
                </p>
                <Link href="/" className="mt-4 text-[#0ac8b9] hover:underline text-sm uppercase tracking-wider">
                    Return to Hub
                </Link>
            </div>

            {/* BINDER GRID */}
            <div className="relative z-10 max-w-3xl mx-auto">
                <div className="grid grid-cols-3 gap-3 md:gap-6 p-4 md:p-8 bg-[#091428]/80 border border-[#c8aa6e]/30 rounded-xl backdrop-blur-md shadow-2xl">
                    {/* Binder Rings Simulation */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-12 -ml-6 md:-ml-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-4 h-12 md:w-6 md:h-16 bg-gradient-to-r from-[#5c5b57] to-[#1e2328] rounded-l-full shadow-lg border-y border-black/50" />
                        ))}
                    </div>

                    {showcase.map((cardId, index) => {
                        const card = cardId ? MOCK_CARDS.find(c => c.id === cardId) : null;

                        return (
                            <div
                                key={index}
                                onClick={() => setEditingSlot(index)}
                                className={clsx(
                                    "aspect-[2/3] rounded-lg border-2 flex items-center justify-center relative transition-all group cursor-pointer",
                                    card
                                        ? "border-[#c8aa6e]/50 bg-black/50 hover:border-[#c8aa6e] hover:shadow-[0_0_15px_rgba(200,170,110,0.3)]"
                                        : "border-[#0ac8b9]/20 bg-[#0ac8b9]/5 hover:bg-[#0ac8b9]/10 border-dashed"
                                )}
                            >
                                {card ? (
                                    <>
                                        <div className="w-full h-full p-1 md:p-2">
                                            <CardComponent card={card} />
                                        </div>
                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => handleClearSlot(e, index)}
                                            className="absolute -top-2 -right-2 bg-red-900 border border-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-[#0ac8b9]/50 group-hover:text-[#0ac8b9]">
                                        <Plus className="w-8 h-8 mb-2" />
                                        <span className="text-[10px] md:text-sm uppercase tracking-widest font-bold">Slot {index + 1}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SELECTION MODAL */}
            {editingSlot !== null && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#091428] border-2 border-[#c8aa6e] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(200,170,110,0.2)] animate-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[#c8aa6e]/30 flex justify-between items-center bg-[#010a13]/50">
                            <div>
                                <h3 className="text-xl font-bold text-[#f0e6d2]">Select Card</h3>
                                <p className="text-xs text-[#a09b8c]">Slot {editingSlot + 1} &bull; Showing Owned Cards</p>
                            </div>
                            <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-6 h-6 text-[#c8aa6e]" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#add8e6]" />
                                <input
                                    type="text"
                                    placeholder="Search your collection..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#010a13] border border-[#0ac8b9]/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#0ac8b9] outline-none text-[#f0e6d2] placeholder-[#a09b8c]/50"
                                />
                            </div>
                        </div>

                        {/* Card Grid */}
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {availableCards.length > 0 ? availableCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => handleSelectCard(card)}
                                    className="cursor-pointer hover:scale-105 transition-transform"
                                >
                                    <div className="pointer-events-none">
                                        <CardComponent card={card} />
                                    </div>
                                    <p className="mt-1 text-center text-xs truncate text-[#a09b8c]">{card.name}</p>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 flex flex-col items-center text-[#5c5b57]">
                                    <Lock className="w-12 h-12 mb-4 opacity-50" />
                                    <p>No cards found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
