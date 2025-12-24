'use client';

import React, { useEffect, useState } from 'react';
import { getFriendEchoes, FriendActivity } from '@/services/social-service';
import { Card as CardComponent } from '@/components/Card';
import { useCollectionStore } from '@/store/collection-store';
import { Loader2, Radio, User, Gem } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import EnergyWidget from '@/components/layout/EnergyWidget';

export default function HextechEchoPage() {
    const [echoes, setEchoes] = useState<FriendActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEcho, setSelectedEcho] = useState<FriendActivity | null>(null);
    const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
    const { addCard } = useCollectionStore();

    useEffect(() => {
        loadEchoes();
    }, []);

    const loadEchoes = async () => {
        const data = await getFriendEchoes();
        setEchoes(data);
        setLoading(false);
    };

    const handlePickCard = (index: number) => {
        if (revealedIndex !== null) return;
        setRevealedIndex(index);

        // Add to collection
        if (selectedEcho) {
            const card = selectedEcho.packResult[index];
            addCard(card.id, 'VIRTUAL');
        }
    };

    const closeSelection = () => {
        setSelectedEcho(null);
        setRevealedIndex(null);
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] p-4 md:p-8 pt-20 font-serif relative overflow-hidden">
            <EnergyWidget />

            {/* Background Radar Effect */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-[800px] h-[800px] border border-[#0ac8b9] rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute w-[600px] h-[600px] border border-[#c8aa6e] rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col items-center">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#0ac8b9] via-[#f0e6d2] to-[#0ac8b9] text-center" style={{ fontFamily: 'Beaufort' }}>
                        HEXTECH ECHO
                    </h1>
                    <p className="mt-2 text-[#a09b8c] text-center text-sm md:text-base px-4">
                        Tune into the multiverse. Capture a card from a friend's timeline.
                    </p>
                </header>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0ac8b9]" />
                    </div>
                ) : !selectedEcho ? (
                    /* ECHO LIST */
                    <div className="grid gap-4">
                        {echoes.map((echo) => (
                            <div
                                key={echo.id}
                                onClick={() => setSelectedEcho(echo)}
                                className="group relative bg-[#091428]/80 border border-[#0ac8b9]/30 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-[#1e2328] hover:border-[#0ac8b9] transition-all hover:scale-[1.02]"
                            >
                                {/* Avatar */}
                                <img src={echo.avatarUrl} alt={echo.username} className="w-12 h-12 rounded-full border-2 border-[#c8aa6e]" />

                                <div className="flex-1">
                                    <h3 className="font-bold text-[#f0e6d2]">{echo.username}</h3>
                                    <p className="text-xs text-[#0ac8b9]">Opened a Pack &bull; {echo.timeAgo}</p>
                                </div>

                                <div className="text-[#c8aa6e] flex items-center gap-2">
                                    <span className="text-xs uppercase font-bold tracking-wider">Intercept</span>
                                    <Radio className="w-5 h-5 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* SELECTION SCREEN */
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-[#c8aa6e]">PICK A SIGNAL</h2>
                            <p className="text-sm text-[#a09b8c]">One card will be added to your collection.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 perspective-1000">
                            {selectedEcho.packResult.map((card, idx) => {
                                const isRevealed = revealedIndex === idx;
                                const isChoseOther = revealedIndex !== null && !isRevealed;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handlePickCard(idx)}
                                        className={clsx(
                                            "relative w-32 h-48 md:w-40 md:h-56 transition-all duration-500 transform-style-3d cursor-pointer",
                                            isRevealed ? "rotate-y-0 scale-110 z-20" : "rotate-y-180 bg-[#1e2328] border-2 border-[#c8aa6e] rounded-xl flex items-center justify-center hover:-translate-y-2",
                                            isChoseOther && "opacity-50 grayscale scale-90"
                                        )}
                                        style={{ transformStyle: 'preserve-3d', transform: isRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)' }}
                                    >
                                        {/* FRONT (Revealed) */}
                                        <div className="absolute inset-0 backface-hidden">
                                            <CardComponent card={card} />
                                        </div>

                                        {/* BACK (Hidden) */}
                                        <div className="absolute inset-0 backface-hidden bg-[url('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loot/hextech_chest_opening_texture.png')] bg-cover bg-center rounded-xl flex items-center justify-center rotate-y-180"
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                            <Gem className="w-12 h-12 text-[#0ac8b9] animate-pulse" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {revealedIndex !== null && (
                            <div className="mt-12 animate-in fade-in slide-in-from-bottom-5">
                                <button onClick={closeSelection} className="btn-hextech-primary">
                                    CONFIRM & EXIT
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link href="/" className="text-[#0ac8b9] hover:underline text-sm uppercase tracking-wider">
                        Return to Hub
                    </Link>
                </div>
            </div>
        </main>
    );
}
