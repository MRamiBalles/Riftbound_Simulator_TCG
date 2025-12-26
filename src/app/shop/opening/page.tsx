'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackService } from '@/services/pack-service';
import { getCards } from '@/services/card-service';
import { VfxService } from '@/services/vfx-service';
import { SocialService } from '@/services/social-service';
import { Card } from '@/lib/database.types';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ArrowRight, Scissors } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function PackOpeningPage() {
    const searchParams = useSearchParams();
    const packType = (searchParams.get('pack') || 'alpha') as 'alpha' | 'omega' | 'void';
    const count = parseInt(searchParams.get('count') || '1');
    const { pityCounter, registerPackOpening, consumeEnergy } = useUserStore();

    const [step, setStep] = useState<'IDLE' | 'CUTTING' | 'REVEALING' | 'DONE'>('IDLE');
    const [packCards, setPackCards] = useState<Card[]>([]);
    const [bulkResults, setBulkResults] = useState<Card[][]>([]);
    const [revealIndex, setRevealIndex] = useState(0);
    const [bulkIndex, setBulkIndex] = useState(0);
    const [isGodPack, setIsGodPack] = useState(false);

    useEffect(() => {
        getCards().then(allCards => {
            if (count > 1) {
                const results = PackService.openBulk(allCards, packType, pityCounter, count);
                setBulkResults(results);
                setPackCards(results[0]);
                const hasGod = results.some((p: Card[]) => p.filter((c: Card) => ['Legendary', 'Champion'].includes(c.rarity)).length >= 2);
                setIsGodPack(hasGod);
            } else {
                const cards = PackService.openPack(allCards, packType, pityCounter);
                setPackCards(cards);
                if (cards.filter(c => ['Legendary', 'Champion'].includes(c.rarity)).length >= 2) setIsGodPack(true);
            }
        });
    }, [packType, pityCounter, count]);

    const handleCut = () => {
        if (!consumeEnergy(12 * count)) return;

        setStep('CUTTING');
        VfxService.trigger('PACK_OPEN');

        // Register opening logic
        const anyRare = count > 1 ?
            bulkResults.some(p => p.some(c => ['Legendary', 'Champion'].includes(c.rarity))) :
            packCards.some(c => ['Legendary', 'Champion'].includes(c.rarity));

        registerPackOpening(anyRare, count);

        // Broadcast IF it's a hit!
        if (anyRare) {
            SocialService.broadcastPull('MasterPlayer', 50, packCards, packType);
        }

        if (isGodPack) {
            setTimeout(() => VfxService.trigger('CRITICAL_HIT'), 800);
        }
        setTimeout(() => setStep('REVEALING'), 1500);
    };

    const handleNext = () => {
        const currentCard = packCards[revealIndex];
        if (['Legendary', 'Champion'].includes(currentCard?.rarity)) {
            VfxService.trigger('CRITICAL_HIT');
        }

        if (revealIndex < packCards.length - 1) {
            setRevealIndex(prev => prev + 1);
        } else if (count > 1 && bulkIndex < count - 1) {
            setBulkIndex(prev => prev + 1);
            setPackCards(bulkResults[bulkIndex + 1]);
            setRevealIndex(0);
        } else {
            setStep('DONE');
            VfxService.trigger('VICTORY');
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden flex flex-col items-center justify-center">
            <EnergyWidget />

            <AnimatePresence mode="wait">
                {step === 'IDLE' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <div className="relative w-64 h-96 group cursor-pointer" onClick={handleCut}>
                            <div className="absolute inset-0 bg-gradient-to-b from-[#c8aa6e] to-black rounded-[2.5rem] p-1">
                                <div className="w-full h-full bg-[#091428] rounded-[2.4rem] flex flex-col items-center justify-center border border-white/10 overflow-hidden relative">
                                    <div className="absolute top-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#c8aa6e]">GENETIC ORIGINS</div>
                                    <div className="w-32 h-32 rounded-full bg-[#c8aa6e]/10 flex items-center justify-center animate-pulse">
                                        <Zap size={48} className="text-[#c8aa6e]" />
                                    </div>
                                    <div className="absolute bottom-12 font-black text-2xl uppercase italic">{packType} CORE</div>
                                </div>
                            </div>

                            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center text-black animate-bounce shadow-2xl">
                                <Scissors size={24} />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Ready to Breach</h2>
                            <p className="text-[10px] text-[#a09b8c] font-black uppercase tracking-[0.3em]">TAP OR SWIPE TOP TO OPEN</p>
                        </div>
                    </motion.div>
                )}

                {step === 'REVEALING' && (
                    <motion.div
                        key="revealing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-12 w-full max-w-lg"
                    >
                        <div className="relative">
                            {isGodPack && (
                                <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,rgba(200,170,110,0.2)_0%,transparent_70%)] animate-pulse" />
                            )}

                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={packCards[revealIndex]?.id}
                                    initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -100, rotateZ: -10 }}
                                    transition={{ type: 'spring', damping: 20 }}
                                >
                                    <ImmersiveCard card={packCards[revealIndex]} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2 mb-4">
                                {packCards.map((_, i) => (
                                    <div
                                        key={i}
                                        className={clsx(
                                            "w-2 h-2 rounded-full transition-all duration-500",
                                            i === revealIndex ? "bg-[#c8aa6e] w-8" : i < revealIndex ? "bg-[#0ac8b9]" : "bg-white/10"
                                        )}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="btn-hextech-primary px-12 py-4 text-sm flex items-center gap-3 group"
                            >
                                {revealIndex < packCards.length - 1 ? 'REVEAL NEXT' : 'FINALIZE PULL'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'DONE' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-16 w-full max-w-7xl"
                    >
                        <div className={clsx(
                            "grid gap-4 w-full",
                            count > 1 ? "grid-cols-5 md:grid-cols-10" : "grid-cols-2 md:grid-cols-5"
                        )}>
                            {(count > 1 ? bulkResults.flat() : packCards).map((card, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: count > 1 ? 0.4 : 0.75 }}
                                    transition={{ delay: i * (count > 1 ? 0.02 : 0.1) }}
                                    className="origin-center"
                                >
                                    <ImmersiveCard card={card} />
                                </motion.div>
                            ))}
                        </div>

                        <div className="space-y-6 text-center">
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                                {count > 1 ? 'BOX PULL COMPLETED' : 'PULL COMPLETED'}
                            </h2>
                            <div className="flex gap-4 justify-center">
                                <Link href="/shop" className="btn-hextech px-12 py-4 text-sm font-black uppercase">Another Pack</Link>
                                <Link href="/vault" className="btn-hextech-primary px-12 py-4 text-sm font-black uppercase">View Collection</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
