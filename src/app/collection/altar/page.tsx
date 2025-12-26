'use client';

import React, { useState, useEffect } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { useUserStore } from '@/store/user-store';
import { CraftService } from '@/services/craft-service';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Hammer, Zap, Info, Wand2, Star } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function AltarPage() {
    const { inventory, removeCard, addCard } = useCollectionStore();
    const { starDust, addStarDust } = useUserStore();
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isTransmuting, setIsTransmuting] = useState(false);

    useEffect(() => {
        getCards().then(setAllCards);
    }, []);

    const duplicates = Object.entries(inventory)
        .filter(([id, counts]) => (counts.virtual + counts.real) > 3)
        .map(([id, counts]) => ({
            card: allCards.find(c => c.id === id)!,
            count: (counts.virtual + counts.real) - 3
        }))
        .filter(d => d.card);

    const handleDust = (card: Card) => {
        setIsTransmuting(true);
        const value = CraftService.getDustValue(card);

        setTimeout(() => {
            removeCard(card.id, 'VIRTUAL');
            addStarDust(value);
            setIsTransmuting(false);
            setSelectedCard(null);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16 flex justify-between items-center">
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            ALTAR OF TRANSCENDENCE
                        </h1>
                        <p className="text-[#a09b8c] text-xs font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                            <Sparkles size={14} className="text-[#c8aa6e]" /> TRANSMUTE DUPLICATES INTO STAR DUST
                        </p>
                    </div>
                    <div className="bg-black/40 border border-[#c8aa6e]/20 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest">STAR DUST</div>
                            <div className="text-2xl font-black text-white">{starDust.toLocaleString()}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#c8aa6e]/10 flex items-center justify-center border border-[#c8aa6e]/30">
                            <Star size={20} className="text-[#c8aa6e] fill-[#c8aa6e]/20" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <Trash2 size={16} className="text-red-500" /> EXCESS INVENTORY (3+)
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {duplicates.length > 0 ? duplicates.map((d, idx) => (
                                <motion.div
                                    key={d.card.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedCard(d.card)}
                                    className={clsx(
                                        "relative cursor-pointer transition-all",
                                        selectedCard?.id === d.card.id ? "scale-105" : "hover:scale-102"
                                    )}
                                >
                                    <ImmersiveCard card={d.card} size="sm" />
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                                        x{d.count}
                                    </div>
                                    <div className="absolute -bottom-2 inset-x-4 bg-black/80 border border-white/10 rounded-lg py-1 text-[8px] font-black text-[#c8aa6e] text-center uppercase tracking-widest">
                                        +{CraftService.getDustValue(d.card)} DUST
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    <Sparkles size={48} className="text-[#5c5b57] mx-auto mb-4 opacity-20" />
                                    <p className="text-sm text-[#5c5b57] uppercase tracking-widest font-black">No duplicates found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gradient-to-b from-black/80 to-[#c8aa6e]/5 border border-[#c8aa6e]/30 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Hammer size={16} className="text-[#c8aa6e]" /> SELECTED VESSEL
                            </h3>

                            {selectedCard ? (
                                <div className="space-y-8">
                                    <div className="flex justify-center">
                                        <div className="w-48 h-64 scale-110">
                                            <ImmersiveCard card={selectedCard} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl">
                                            <span className="text-[10px] font-black text-[#5c5b57] uppercase">RARITY</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedCard.rarity}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 p-4 rounded-xl">
                                            <span className="text-[10px] font-black text-[#c8aa6e] uppercase">YIELD</span>
                                            <span className="text-xl font-black text-white">{CraftService.getDustValue(selectedCard)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDust(selectedCard)}
                                        disabled={isTransmuting}
                                        className="w-full btn-hextech-primary py-6 text-xs font-black uppercase tracking-[0.3em] relative overflow-hidden group shadow-[0_0_50px_rgba(200,170,110,0.1)]"
                                    >
                                        <span className="relative z-10 text-black">
                                            {isTransmuting ? 'TRANSMUTING...' : 'EXTRACT STAR DUST'}
                                        </span>
                                        {isTransmuting && (
                                            <motion.div
                                                className="absolute inset-0 bg-white"
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 border-2 border-dashed border-[#5c5b57] rounded-full mx-auto flex items-center justify-center">
                                        <Zap size={24} className="text-[#5c5b57]" />
                                    </div>
                                    <p className="text-[10px] text-[#5c5b57] uppercase tracking-[0.2em]">Select a duplicate card to extract its essence.</p>
                                </div>
                            )}

                            {/* DECORATIVE RUNE */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#c8aa6e]/5 flex items-center justify-center rounded-full blur-3xl pointer-events-none" />
                        </div>

                        <div className="bg-black/60 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl">
                            <h4 className="text-[10px] font-black text-[#a09b8c] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={12} /> ALTAR RULES
                            </h4>
                            <ul className="space-y-3 text-[10px] text-[#5c5b57] font-bold uppercase tracking-tighter">
                                <li className="flex gap-2"><span>•</span> CARDS ARE PERMANENTLY CONSUMED</li>
                                <li className="flex gap-2"><span>•</span> DECK VALIDITY IS PROTECTED (MIN 3 KEPT)</li>
                                <li className="flex gap-2"><span>•</span> STAR DUST IS USED TO CRAFT ANY CARD</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
