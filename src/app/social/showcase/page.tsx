'use client';

import React, { useState } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { MOCK_CARDS, getCardById } from '@/services/card-service';
import { Card as CardComponent } from '@/components/Card';
import { Loader2, Heart, Plus, Trophy, Share2 } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import EnergyWidget from '@/components/layout/EnergyWidget';

export default function ShowcasePage() {
    const { showcase, setShowcaseSlot, inventory } = useCollectionStore();
    const [isEditing, setIsEditing] = useState(false);
    const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
    const [kudos, setKudos] = useState(42); // Mock initial kudos

    // Get cards available for showcase (must be owned)
    const ownedCards = MOCK_CARDS.filter(c => {
        const entry = inventory[c.id];
        return entry && (entry.virtual > 0 || entry.real > 0);
    });

    const handleSlotClick = (index: number) => {
        if (!isEditing) return;
        setSelectingSlot(index);
    };

    const handleSelectCard = (cardId: string) => {
        if (selectingSlot !== null) {
            setShowcaseSlot(selectingSlot, cardId);
            setSelectingSlot(null);
        }
    };

    const handleRemoveCard = () => {
        if (selectingSlot !== null) {
            setShowcaseSlot(selectingSlot, null);
            setSelectingSlot(null);
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] p-4 md:p-8 pt-20 font-serif relative overflow-y-auto">
            <EnergyWidget />

            {/* Background Flair */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#7a5c29]/20 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-[#c8aa6e] bg-[#091428] mb-4 flex items-center justify-center overflow-hidden">
                        <img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/588.png" alt="Avatar" className="w-full h-full object-cover" />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e]" style={{ fontFamily: 'Beaufort' }}>
                        SUMMONER
                    </h1>

                    <div className="flex gap-4 mt-4">
                        <button onClick={() => setKudos(kudos + 1)} className="flex items-center gap-2 bg-[#c8aa6e]/10 px-4 py-1 rounded-full border border-[#c8aa6e] text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#010a13] transition-colors">
                            <Heart className={clsx("w-4 h-4", kudos > 42 && "fill-current")} />
                            <span className="font-bold">{kudos} Kudos</span>
                        </button>
                        <div className="flex items-center gap-2 bg-[#0ac8b9]/10 px-4 py-1 rounded-full border border-[#0ac8b9] text-[#0ac8b9]">
                            <Trophy className="w-4 h-4" />
                            <span className="font-bold">Top 1%</span>
                        </div>
                    </div>
                </header>

                <div className="flex justify-between items-center mb-4 px-4">
                    <h2 className="text-xl text-[#a09b8c] tracking-widest uppercase font-bold">Showcase Binder</h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={clsx(
                            "btn-hextech px-4 py-1 text-xs",
                            isEditing ? "border-[#0ac8b9] text-[#0ac8b9]" : ""
                        )}
                    >
                        {isEditing ? 'DONE EDITING' : 'EDIT SHOWCASE'}
                    </button>
                </div>

                {/* 3x3 GRID */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 bg-[#091428]/50 border border-[#7a5c29] rounded-xl shadow-2xl backdrop-blur-sm max-w-lg mx-auto">
                    {showcase.map((cardId, index) => {
                        const card = cardId ? MOCK_CARDS.find(c => c.id === cardId) : null;

                        return (
                            <div
                                key={index}
                                onClick={() => handleSlotClick(index)}
                                className={clsx(
                                    "aspect-[3/4] rounded-lg border-2 flex items-center justify-center relative overflow-hidden transition-all",
                                    card ? "border-[#c8aa6e]" : "border-[#7a5c29]/30 bg-[#010a13]/50",
                                    isEditing && "hover:border-[#0ac8b9] cursor-pointer hover:bg-[#0ac8b9]/10",
                                    !card && isEditing && "animate-pulse"
                                )}
                            >
                                {card ? (
                                    <div className="w-full h-full transform transition-transform hover:scale-110">
                                        <CardComponent card={card} />
                                    </div>
                                ) : (
                                    isEditing && <Plus className="w-8 h-8 text-[#0ac8b9]" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* CARD SELECTOR MODAL */}
                {selectingSlot !== null && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-[#091428] border border-[#c8aa6e] w-full max-w-2xl max-h-[80vh] rounded-xl flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-[#c8aa6e]/30 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-[#c8aa6e]">Select Card for Slot {selectingSlot + 1}</h3>
                                <button onClick={() => setSelectingSlot(null)} className="text-[#a09b8c] hover:text-[#f0e6d2]">✕</button>
                            </div>

                            <div className="p-6 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-4">
                                <button
                                    onClick={handleRemoveCard}
                                    className="aspect-[3/4] border-2 border-dashed border-red-500/50 rounded-lg flex flex-col items-center justify-center text-red-400 hover:bg-red-500/10"
                                >
                                    <span>Empty Slot</span>
                                </button>

                                {ownedCards.map(card => (
                                    <div key={card.id} onClick={() => handleSelectCard(card.id)} className="cursor-pointer hover:scale-105 transition-transform">
                                        <CardComponent card={card} />
                                    </div>
                                ))}

                                {ownedCards.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-[#a09b8c]">
                                        No cards owned. Open packs or scan cards first!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center pb-20">
                    <Link href="/" className="btn-hextech inline-block">
                        BACK TO HUB
                    </Link>
                </div>
            </div>
        </main>
    );
}
