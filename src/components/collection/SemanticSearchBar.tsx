'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCollectionStore } from '@/store/collection-store';
import { motion, AnimatePresence } from 'framer-motion';

export function SemanticSearchBar() {
    const { searchQuery, setSearchQuery, resetFilters } = useCollectionStore();

    return (
        <div className="relative group w-full max-w-2xl mx-auto">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c8aa6e]/20 via-[#0ac8b9]/20 to-[#c8aa6e]/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative flex items-center bg-[#010a13]/80 border border-white/10 group-hover:border-[#c8aa6e]/40 rounded-2xl px-6 py-4 backdrop-blur-xl transition-all duration-500">
                <Search className="text-[#c8aa6e] opacity-50 group-hover:opacity-100 transition-opacity" size={20} />

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, keyword or 'cost:5'..."
                    className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-white placeholder-[#5c5b57] focus:ring-0"
                />

                <AnimatePresence>
                    {searchQuery && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setSearchQuery('')}
                            className="p-1 hover:bg-white/10 rounded-lg text-[#a09b8c] hover:text-white transition-all mr-2"
                        >
                            <X size={16} />
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[#c8aa6e]/30 text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest transition-all"
                >
                    <SlidersHorizontal size={14} />
                    RESET
                </button>
            </div>

            {/* Hint for Power Users */}
            <div className="mt-3 flex gap-4 justify-center">
                {['rare:legendary', 'cost:7', 'set:origins'].map((hint) => (
                    <button
                        key={hint}
                        onClick={() => setSearchQuery(hint)}
                        className="text-[9px] font-black text-[#5c5b57] hover:text-[#c8aa6e] uppercase tracking-widest transition-colors"
                    >
                        {hint}
                    </button>
                ))}
            </div>
        </div>
    );
}
