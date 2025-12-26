'use client';

import React, { useState, useEffect } from 'react';
import { PackService } from '@/services/pack-service';
import { Card as CardComponent } from '@/components/Card';
import { useUserStore } from '@/store/user-store';
import { useMissionStore } from '@/store/mission-store';
import { Loader2, Sparkles, Box } from 'lucide-react';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import clsx from 'clsx';
import Link from 'next/link';
import EnergyWidget from '@/components/layout/EnergyWidget';

export default function PackOpenerPage() {
    const { getRefreshedEnergy, consumeEnergy, registerPackOpening } = useUserStore();
    const { updateProgress } = useMissionStore();

    const [isOpening, setIsOpening] = useState(false);
    const [openedCards, setOpenedCards] = useState<Card[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [allCards, setAllCards] = useState<Card[]>([]);

    useEffect(() => {
        getCards().then(setAllCards);
    }, []);

    const handleOpen = async () => {
        if (isOpening) return;
        const currentEnergy = getRefreshedEnergy();

        if (currentEnergy < 12) { // Assuming 12 energy for a standard pack in legacy view, or 1? Let's check user store logic. standard usage
            // Actually consumeEnergy handles the check.
        }

        setError(null);
        setOpenedCards(null);
        setIsOpening(true);

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1000));

        if (consumeEnergy(12)) {
            try {
                // Using 'alpha' and 0 pity for legacy simple opener
                const cards = PackService.openPack(allCards, 'alpha', 0);
                setOpenedCards(cards);

                const hasUltraRare = cards.some(c => ['Legendary', 'Champion'].includes(c.rarity));
                registerPackOpening(hasUltraRare, 1, 0);

                // Update Daily Mission: Open 1 Pack
                updateProgress('d1', 1);
            } catch (e) {
                console.error(e);
                setError("Failed to open pack.");
            } finally {
                setIsOpening(false);
            }
        } else {
            setError("Not enough Energy! Need 12.");
            setIsOpening(false);
        }
    };

    const reset = () => {
        setOpenedCards(null);
    };

    return (
        <main className="min-h-screen bg-[#010a13] flex flex-col items-center justify-center p-4 relative overflow-hidden text-[#f0e6d2] font-serif">
            <EnergyWidget />

            {/* Background VFX */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#0ac8b9_0%,transparent_70%)] opacity-10 blur-3xl" />

            {!openedCards ? (
                /* PACK STATE */
                <div className="z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500 w-full px-4">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-widest uppercase text-[#c8aa6e]">
                        Open Hextech Chest
                    </h1>

                    <div
                        onClick={handleOpen}
                        className={clsx(
                            "relative w-48 h-64 md:w-64 md:h-80 bg-gradient-to-br from-[#1e2328] to-[#091428] border-4 border-[#c8aa6e] rounded-xl cursor-pointer transition-all duration-300 transform",
                            "hover:scale-105 hover:shadow-[0_0_50px_rgba(200,170,110,0.4)] active:scale-95",
                            isOpening && "animate-pulse scale-110 shadow-[0_0_80px_rgba(10,200,185,0.8)]"
                        )}
                    >
                        {/* Chest Design */}
                        <div className="absolute inset-x-0 top-1/2 h-2 bg-[#c8aa6e] shadow-lg" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Box className={clsx(
                                "w-24 h-24 text-[#c8aa6e] drop-shadow-[0_0_10px_rgba(200,170,110,0.8)]",
                                isOpening && "animate-spin"
                            )} />
                        </div>

                        {isOpening && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                <Loader2 className="w-12 h-12 animate-spin text-[#0ac8b9]" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <p className="text-[#a09b8c] uppercase tracking-wider text-sm font-bold">
                            Cost: 12 Energy
                        </p>
                        {error && (
                            <p className="text-red-400 bg-red-900/20 px-4 py-2 rounded border border-red-500/50">
                                {error}
                            </p>
                        )}
                        <Link href="/" className="text-sm text-[#0ac8b9] hover:underline underline-offset-4">
                            Back to Hub
                        </Link>
                    </div>
                </div>
            ) : (
                /* REVEAL STATE */
                <div className="z-10 w-full max-w-6xl flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-700">
                    <div className="flex flex-wrap justify-center gap-6 mb-12 perspective-1000">
                        {openedCards.map((card, index) => (
                            <div
                                key={index}
                                className="animate-in zoom-in fade-in duration-500"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <CardComponent card={card} />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={reset}
                            className="btn-hextech-primary"
                        >
                            OPEN ANOTHER
                        </button>
                        <Link href="/decks" className="btn-hextech">
                            GO TO COLLECTION
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}
