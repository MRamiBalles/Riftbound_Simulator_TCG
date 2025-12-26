'use client';

import React, { useState, useEffect } from 'react';
import { MetaService, MetaDeck } from '@/services/meta-service';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3, ChevronRight, Info } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function MetaDashboardPage() {
    const [metaDecks, setMetaDecks] = useState<MetaDeck[]>([]);
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<MetaDeck | null>(null);

    useEffect(() => {
        setMetaDecks(MetaService.getMetaDecks());
        getCards().then(setAllCards);
    }, []);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'S': return 'text-yellow-400 border-yellow-400/50 from-yellow-400/20';
            case 'A': return 'text-[#0ac8b9] border-[#0ac8b9]/50 from-[#0ac8b9]/20';
            case 'B': return 'text-purple-400 border-purple-400/50 from-purple-400/20';
            default: return 'text-gray-400 border-gray-400/50 from-gray-400/20';
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            META ANALYTICS
                        </h1>
                        <p className="text-[#add8e6] text-xs font-black uppercase tracking-[0.4em] mt-2 flex items-center justify-center md:justify-start gap-2">
                            <BarChart3 size={14} /> LIVE HIERARCHY: GENETIC ORIGINS SEASON
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xl text-center min-w-[120px]">
                            <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">DATA REFRESH</div>
                            <div className="text-sm font-black text-white">4h 12m</div>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xl text-center min-w-[120px]">
                            <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">SAMPLE SIZE</div>
                            <div className="text-sm font-black text-[#0ac8b9]">1.4M PULLS</div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* TIER LIST COLUMN */}
                    <div className="lg:col-span-8 space-y-6">
                        {metaDecks.map((deck, idx) => (
                            <motion.div
                                key={deck.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedDeck(deck)}
                                className={clsx(
                                    "relative bg-black/40 border-l-4 rounded-r-3xl p-6 backdrop-blur-xl cursor-pointer transition-all hover:translate-x-2 group overflow-hidden",
                                    getTierColor(deck.tier).split(' ')[1], // Use the border color
                                    selectedDeck?.id === deck.id ? "bg-white/5 border-white/20" : "border-white/5"
                                )}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className={clsx(
                                            "w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl font-black bg-gradient-to-b",
                                            getTierColor(deck.tier)
                                        )}>
                                            {deck.tier}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#c8aa6e] transition-colors">{deck.name}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1 text-[10px] font-black text-[#0ac8b9] uppercase">
                                                    <Target size={12} /> WR {deck.winRate}%
                                                </div>
                                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                                <div className="text-[10px] font-black text-[#5c5b57] uppercase">
                                                    PR {deck.playRate}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="flex gap-2">
                                            {deck.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-[#a09b8c]">{tag}</span>
                                            ))}
                                        </div>
                                        <div className={clsx(
                                            "flex items-center gap-1",
                                            deck.trend === 'UP' ? 'text-green-400' : deck.trend === 'DOWN' ? 'text-red-400' : 'text-gray-400'
                                        )}>
                                            {deck.trend === 'UP' ? <TrendingUp size={16} /> : deck.trend === 'DOWN' ? <TrendingDown size={16} /> : <Minus size={16} />}
                                        </div>
                                        <ChevronRight size={24} className="text-[#5c5b57] group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/2 to-transparent -skew-x-12 transform translate-x-32 group-hover:translate-x-16 transition-transform" />
                            </motion.div>
                        ))}
                    </div>

                    {/* DETAIL SIDEBAR */}
                    <div className="lg:col-span-4">
                        <AnimatePresence mode="wait">
                            {selectedDeck ? (
                                <motion.div
                                    key={selectedDeck.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-black/60 border border-[#c8aa6e]/30 rounded-[3rem] p-10 backdrop-blur-3xl sticky top-24"
                                >
                                    <div className="mb-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{selectedDeck.name}</h2>
                                            <span className={clsx("text-5xl font-black", getTierColor(selectedDeck.tier).split(' ')[0])}>{selectedDeck.tier}</span>
                                        </div>
                                        <p className="text-sm text-[#a09b8c] leading-relaxed">{selectedDeck.description}</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em] mb-4">CORE SYNERGIES</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedDeck.coreCards.map(cardId => {
                                                    const card = allCards.find(c => c.id === cardId);
                                                    return (
                                                        <div key={cardId} className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center gap-2 group cursor-pointer hover:border-[#c8aa6e]/50 transition-all">
                                                            <div className="w-12 h-16 bg-[#091428] rounded-md border border-white/10 flex items-center justify-center overflow-hidden">
                                                                {card ? (
                                                                    <div className="text-[8px] font-black text-center p-1 leading-none">{card.name}</div>
                                                                ) : (
                                                                    <Info size={16} className="text-[#5c5b57]" />
                                                                )}
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase text-center truncate w-full">{card?.name || 'Loading...'}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/5">
                                            <Link href={`/decks/builder?meta=${selectedDeck.id}`} className="w-full btn-hextech-primary py-4 text-xs font-black uppercase tracking-[0.2em] block text-center text-black">
                                                CLONE META DECK
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full bg-black/40 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
                                    <BarChart3 size={64} className="text-[#5c5b57] mb-6 opacity-20" />
                                    <h4 className="text-lg font-black text-[#5c5b57] uppercase tracking-widest">Select a Deck</h4>
                                    <p className="text-xs text-[#5c5b57] mt-2">Pick an archetype from the list to view performance data and core components.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}
