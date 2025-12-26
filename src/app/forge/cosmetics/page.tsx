'use client';

import React, { useState, useEffect } from 'react';
import { useCosmeticStore, CardSkin } from '@/store/cosmetic-store';
import { useUserStore } from '@/store/user-store';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, Zap, Lock, CheckCircle, Palette, History, Star, Shield, Orbit } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function PrismForgePage() {
    const { ownedSkins, equippedSkins, unlockSkin, equipSkin } = useCosmeticStore();
    const { starDust, addStarDust } = useUserStore();

    const [allCards, setAllCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isForging, setIsForging] = useState(false);

    useEffect(() => {
        getCards().then(setAllCards);
    }, []);

    const skins: { id: CardSkin, name: string, cost: number, icon: React.ComponentType<{ size?: number, className?: string }> }[] = [
        { id: 'DEFAULT', name: 'Standard Art', cost: 0, icon: Palette },
        { id: 'GOLD_BORDER', name: 'Gold Trim', cost: 2500, icon: Shield },
        { id: 'PRISM', name: 'Prism Holo', cost: 10000, icon: Sparkles },
        { id: 'VOID_STATIC', name: 'Void Essence', cost: 5000, icon: Orbit }
    ];

    const handleUnlock = (skin: typeof skins[0]) => {
        if (selectedCard && starDust >= skin.cost) {
            setIsForging(true);
            setTimeout(() => {
                addStarDust(-skin.cost);
                unlockSkin(selectedCard.id, skin.id);
                setIsForging(false);
            }, 1000);
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            PRISM FORGE
                        </h1>
                        <p className="text-[#0ac8b9] text-xs font-black uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
                            <Wand2 size={14} /> COSMETIC TRANSCENDENCE
                        </p>
                    </div>

                    <div className="flex items-center gap-6 bg-black/40 border border-[#0ac8b9]/20 rounded-3xl p-6 backdrop-blur-xl">
                        <div className="text-right">
                            <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">FORGE BALANCE</div>
                            <div className="text-2xl font-black text-white">{starDust.toLocaleString()}</div>
                        </div>
                        <Sparkles size={24} className="text-[#0ac8b9]" />
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-16">
                    {/* LEFT: CARD SELECTION */}
                    <div className="col-span-4 space-y-8">
                        <div className="bg-black/40 border border-white/5 rounded-[3rem] p-8 backdrop-blur-xl h-[600px] flex flex-col">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">SELECT CARD</h2>
                            <div className="flex-1 overflow-y-auto pr-4 space-y-2 scrollbar-hide">
                                {allCards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => setSelectedCard(card)}
                                        className={clsx(
                                            "p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group",
                                            selectedCard?.id === card.id ? "bg-[#0ac8b9]/10 border-[#0ac8b9]" : "bg-white/5 border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-black overflow-hidden border border-white/10">
                                                <img src={card.image_url} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-xs font-black text-white uppercase tracking-tight">{card.name}</div>
                                        </div>
                                        {equippedSkins[card.id] && equippedSkins[card.id] !== 'DEFAULT' && <Star size={12} className="text-[#c8aa6e]" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CENTER: PREVIEW */}
                    <div className="col-span-4 flex items-center justify-center relative">
                        <AnimatePresence mode="wait">
                            {selectedCard ? (
                                <motion.div key={selectedCard.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative group">
                                    <div className="absolute -inset-20 bg-gradient-to-t from-[#0ac8b9]/0 via-[#0ac8b9]/10 to-[#0ac8b9]/0 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <ImmersiveCard card={selectedCard} />
                                    {isForging && (
                                        <div className="absolute inset-0 z-50 rounded-2xl bg-[#0ac8b9]/20 backdrop-blur-md flex items-center justify-center">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                                <Sparkles size={48} className="text-white" />
                                            </motion.div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="text-center text-[#5c5b57] uppercase tracking-[0.2em] font-black italic">Select a card to forge</div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: SKINS */}
                    <div className="col-span-4 space-y-8">
                        <div className="bg-black/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-xl">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8">PRISM VARIANTS</h2>
                            <div className="space-y-4">
                                {skins.map(skin => {
                                    const isOwned = (selectedCard && (ownedSkins[selectedCard.id]?.includes(skin.id) || skin.id === 'DEFAULT'));
                                    const isEquipped = selectedCard && equippedSkins[selectedCard.id] === skin.id;
                                    const isDefaultEquipped = selectedCard && !equippedSkins[selectedCard.id] && skin.id === 'DEFAULT';

                                    return (
                                        <div
                                            key={skin.id}
                                            onClick={() => {
                                                if (isOwned) equipSkin(selectedCard!.id, skin.id);
                                                else handleUnlock(skin);
                                            }}
                                            className={clsx(
                                                "p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center group",
                                                isEquipped || isDefaultEquipped ? "bg-[#0ac8b9]/10 border-[#0ac8b9]" :
                                                    isOwned ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-black/40 border-white/5 opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                                                    <skin.icon size={24} className={isEquipped || isDefaultEquipped ? "text-[#0ac8b9]" : "text-[#a09b8c]"} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white uppercase tracking-tight">{skin.name}</div>
                                                    <div className="text-[8px] font-black text-[#5c5b57] uppercase mt-1 tracking-widest">
                                                        {isOwned ? (isEquipped || isDefaultEquipped ? 'ACTIVE' : 'UNLOCKED') : `${skin.cost} STAR DUST`}
                                                    </div>
                                                </div>
                                            </div>
                                            {!isOwned && <Lock size={16} className="text-[#5c5b57]" />}
                                            {(isEquipped || isDefaultEquipped) && <CheckCircle size={16} className="text-[#0ac8b9]" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/20 rounded-[2.5rem] backdrop-blur-xl">
                            <History size={24} className="text-[#c8aa6e] mb-4" />
                            <h3 className="text-xs font-black text-white uppercase tracking-tighter mb-2">FORGE LEGEND</h3>
                            <p className="text-[10px] text-[#a09b8c] leading-relaxed uppercase tracking-widest">Skins applied here will persist across all modes, including Arena and Tournaments.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
