'use client';

import React from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { Shield, Zap, Sparkles, Box, Trash2, Filter } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const RARITIES = [
    { id: 'Common', color: '#a09b8c', icon: Box },
    { id: 'Uncommon', color: '#1fb714', icon: Zap },
    { id: 'Rare', color: '#0070dd', icon: Shield },
    { id: 'Epic', color: '#a335ee', icon: Sparkles },
    { id: 'Legendary', color: '#ff8000', icon: Filter },
    { id: 'Showcase', color: '#c8aa6e', icon: Sparkles },
];

const SETS = ['Origins', 'Spiritforged', 'Proving Grounds', 'Arcane Box Set'];

export function FilterSidebar() {
    const { filters, setFilter, resetFilters } = useCollectionStore();

    return (
        <aside className="w-72 flex flex-col gap-8 bg-black/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl sticky top-24 h-fit">
            <header className="flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Advanced Filters</h3>
                <button
                    onClick={resetFilters}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-[#5c5b57] hover:text-red-500 transition-all"
                    title="Clear All Filters"
                >
                    <Trash2 size={16} />
                </button>
            </header>

            {/* Rarity Section */}
            <div>
                <label className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest mb-4 block">Rarity Tier</label>
                <div className="grid grid-cols-3 gap-3">
                    {RARITIES.map((rarity) => (
                        <button
                            key={rarity.id}
                            onClick={() => setFilter('rarity', filters.rarity === rarity.id ? null : rarity.id)}
                            className={clsx(
                                "group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all relative overflow-hidden",
                                filters.rarity === rarity.id
                                    ? "bg-white/10 border-white/20"
                                    : "bg-black/40 border-white/5 hover:border-white/10"
                            )}
                        >
                            <rarity.icon
                                size={18}
                                style={{ color: filters.rarity === rarity.id ? rarity.color : '#5c5b57' }}
                                className="group-hover:scale-110 transition-transform mb-2"
                            />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-[#5c5b57] group-hover:text-white transition-colors">
                                {rarity.id.slice(0, 4)}
                            </span>

                            {filters.rarity === rarity.id && (
                                <motion.div
                                    layoutId="rarity-glow"
                                    className="absolute inset-0 border-b-2"
                                    style={{ borderColor: rarity.color }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mana Cost Section */}
            <div>
                <label className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest mb-4 block">Mana Core</label>
                <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cost) => (
                        <button
                            key={cost}
                            onClick={() => setFilter('cost', filters.cost === cost ? null : cost)}
                            className={clsx(
                                "w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all",
                                filters.cost === cost
                                    ? "bg-[#c8aa6e] border-[#c8aa6e] text-black shadow-[0_0_15px_rgba(200,170,110,0.4)]"
                                    : "bg-black/60 border-white/10 text-[#a09b8c] hover:border-[#c8aa6e]/50"
                            )}
                        >
                            {cost}{cost === 8 ? '+' : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expansion Sets */}
            <div>
                <label className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest mb-4 block">Expansion Set</label>
                <div className="space-y-2">
                    {SETS.map((setName) => (
                        <button
                            key={setName}
                            onClick={() => setFilter('set', filters.set === setName ? null : setName)}
                            className={clsx(
                                "w-full px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest text-left transition-all",
                                filters.set === setName
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-black/60 border-white/5 text-[#5c5b57] hover:border-white/10 hover:text-[#a09b8c]"
                            )}
                        >
                            {setName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ownership Toggle */}
            <div className="pt-4 border-t border-white/5">
                <button className="w-full btn-hextech py-3 text-[10px]">
                    SHOW ONLY OWNED
                </button>
            </div>
        </aside>
    );
}
