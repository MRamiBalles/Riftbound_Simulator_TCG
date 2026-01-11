'use client';

import React, { useMemo } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { MOCK_CARDS } from '@/services/card-service';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import { FilterSidebar } from '@/components/collection/FilterSidebar';
import { SemanticSearchBar } from '@/components/collection/SemanticSearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export default function CollectionPage() {
    const { inventory, filters, searchQuery } = useCollectionStore();

    // Advanced Filter Engine
    const filteredCards = useMemo(() => {
        return MOCK_CARDS.filter(card => {
            // Search Query Logic (supports keys like cost:5)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();

                // Advanced Syntax Check
                if (query.includes('cost:')) {
                    const cost = parseInt(query.split('cost:')[1]);
                    if (card.cost && parseInt(card.cost) !== cost) return false;
                } else if (query.includes('rare:')) {
                    const rarity = query.split('rare:')[1];
                    if (card.rarity.toLowerCase() !== rarity) return false;
                } else if (query.includes('set:')) {
                    const set = query.split('set:')[1];
                    if (card.set_name.toLowerCase() !== set) return false;
                } else {
                    // Standard text search
                    const nameMatch = card.name.toLowerCase().includes(query);
                    const textMatch = card.text?.toLowerCase().includes(query);
                    const keywordMatch = card.keywords?.some(k => k.toLowerCase().includes(query));
                    if (!nameMatch && !textMatch && !keywordMatch) return false;
                }
            }

            // UI Filter Logic
            if (filters.rarity && card.rarity !== filters.rarity) return false;
            if (filters.cost !== null) {
                const cardCost = card.cost ? parseInt(card.cost) : 0;
                if (filters.cost === 8) {
                    if (cardCost < 8) return false;
                } else if (cardCost !== filters.cost) {
                    return false;
                }
            }
            if (filters.set && card.set_name !== filters.set) return false;

            return true;
        });
    }, [filters, searchQuery]);

    // Possession stats
    const totalOwned = Object.values(inventory).reduce((a, b) => a + b, 0);
    const uniqueOwned = Object.keys(inventory).length;
    const completionRate = Math.round((uniqueOwned / MOCK_CARDS.length) * 100);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-[clamp(1rem,5vw,4rem)] overflow-x-hidden">
            <HextechNavbar />
            <HextechSidebar />

            <div className="max-w-[100rem] mx-auto flex flex-col gap-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.5em]">Inventory Protocol v2.8</span>
                            <div className="h-0.5 w-12 bg-gradient-to-r from-[#c8aa6e] to-transparent"></div>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            COLLECTION <span className="text-[#c8aa6e]">ATLAS</span>
                        </h1>
                    </div>

                    <div className="flex gap-6">
                        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 min-w-[120px]">
                            <span className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">COMPLETION</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-white font-mono">{completionRate}%</span>
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0ac8b9]" style={{ width: `${completionRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 min-w-[120px]">
                            <span className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">ASSETS OWNED</span>
                            <span className="text-2xl font-black text-[#c8aa6e] font-mono">{totalOwned}</span>
                        </div>
                    </div>
                </header>

                {/* Main Experience */}
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col gap-12">
                        {/* Control Bar */}
                        <div className="flex items-center justify-between gap-8 bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
                            <SemanticSearchBar />

                            <div className="flex items-center gap-2 pr-4">
                                <button className="p-3 bg-[#c8aa6e] text-black rounded-xl shadow-[0_0_20px_rgba(200,170,110,0.3)]">
                                    <LayoutGrid size={18} />
                                </button>
                                <button className="p-3 bg-white/5 border border-white/10 text-[#5c5b57] rounded-xl hover:text-white transition-all">
                                    <List size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Card Grid */}
                        <div className="relative">
                            <AnimatePresence mode="popLayout">
                                {filteredCards.length > 0 ? (
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8"
                                    >
                                        {filteredCards.map((card) => {
                                            const qty = inventory[card.id] || 0;
                                            return (
                                                <motion.div
                                                    key={card.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="relative group"
                                                >
                                                    <div className={clsx(
                                                        "transition-all duration-700",
                                                        qty === 0 ? "grayscale opacity-50 contrast-75 hover:grayscale-0 hover:opacity-100 hover:contrast-100" : "hover:scale-105"
                                                    )}>
                                                        <ImmersiveCard card={card as any} />
                                                    </div>

                                                    {/* Owned Badge */}
                                                    <div className={clsx(
                                                        "absolute -bottom-2 -right-2 px-3 py-1 rounded-lg font-mono text-[10px] font-black border transition-all z-20",
                                                        qty > 0
                                                            ? "bg-[#c8aa6e] text-black border-[#c8aa6e] shadow-[0_0_15px_#c8aa6e]"
                                                            : "bg-black/80 text-[#5c5b57] border-white/10"
                                                    )}>
                                                        X{qty}
                                                    </div>

                                                    {qty === 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                            <div className="px-6 py-2 bg-black/80 border border-[#c8aa6e]/30 rounded-xl text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.2em] backdrop-blur-md">
                                                                Not Owned
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-40 gap-6 opacity-40 border-2 border-dashed border-white/5 rounded-[3rem]"
                                    >
                                        <Info size={64} className="text-[#c8aa6e]" />
                                        <div className="text-center">
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Cards Found</h3>
                                            <p className="text-xs text-[#a09b8c] max-w-xs leading-relaxed font-black uppercase tracking-widest">
                                                Your current filters couldn't find any assets. Try resetting or adjusting your query.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Pagination placeholder */}
                        <div className="flex justify-center items-center gap-8 pt-12">
                            <button className="p-4 rounded-full border border-white/5 text-[#5c5b57] hover:border-[#c8aa6e] hover:text-[#c8aa6e] transition-all">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-xs font-black text-[#a09b8c] uppercase tracking-[0.4em]">Chronicle Page 01 / 12</span>
                            <button className="p-4 rounded-full border border-[#c8aa6e]/30 text-[#c8aa6e] hover:bg-[#c8aa6e]/10 transition-all">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
