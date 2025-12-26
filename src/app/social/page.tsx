'use client';

import React, { useState, useEffect } from 'react';
import { SocialService, PublicPull } from '@/services/social-service';
import { useUserStore } from '@/store/user-store';
import { VfxService } from '@/services/vfx-service';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Zap, Timer, Globe, Trophy } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function SocialHubPage() {
    const [feed, setFeed] = useState<PublicPull[]>([]);
    const [selectedPull, setSelectedPull] = useState<PublicPull | null>(null);
    const [wonderStep, setWonderStep] = useState<'IDLE' | 'PICKING' | 'REVEALED'>('IDLE');
    const [pickedCard, setPickedCard] = useState<Card | null>(null);
    const { wonderShards, addWonderShards } = useUserStore();

    useEffect(() => {
        setFeed(SocialService.getFeed());
    }, []);

    const startWonderPick = (pull: PublicPull) => {
        if (wonderShards < 1) return;
        setSelectedPull(pull);
        setWonderStep('PICKING');
    };

    const handlePick = (index: number) => {
        // In a real app, this would be a server-side random pick from the 5 hidden cards
        getCards().then(allCards => {
            // Pick a random card for simulation
            const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
            setPickedCard(randomCard);
            setWonderStep('REVEALED');
            VfxService.trigger('CRITICAL_HIT');
        });
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16 flex justify-between items-end">
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            SOCIAL NEXUS
                        </h1>
                        <p className="text-[#a09b8c] text-xs font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <Globe size={14} className="text-[#0ac8b9]" /> LIVE MULTIVERSE PULL FEED
                        </p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest">WONDER SHARDS</div>
                            <div className="text-2xl font-black text-white">{wonderShards}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#c8aa6e]/10 flex items-center justify-center border border-[#c8aa6e]/30">
                            <Sparkles size={20} className="text-[#c8aa6e]" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* FEED LIST */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence>
                            {feed.map((pull, idx) => (
                                <motion.div
                                    key={pull.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:border-[#c8aa6e]/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c8aa6e] to-black flex items-center justify-center font-black text-white">
                                                {pull.userName[0]}
                                            </div>
                                            <div>
                                                <div className="text-white font-black uppercase tracking-tight">{pull.userName}</div>
                                                <div className="text-[10px] text-[#5c5b57] font-black uppercase tracking-widest flex items-center gap-2">
                                                    LVL {pull.userLevel} <span className="w-1 h-1 bg-white/10 rounded-full" /> {new Date(pull.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-[#0ac8b9] uppercase tracking-widest mb-1">PULL TYPE</div>
                                                <div className="text-xs font-black text-white uppercase italic">{pull.packType} CORE</div>
                                            </div>
                                            <button
                                                onClick={() => startWonderPick(pull)}
                                                className={clsx(
                                                    "btn-hextech px-6 py-3 text-[10px] font-black uppercase flex items-center gap-2",
                                                    wonderShards < 1 && "opacity-50 grayscale pointer-events-none"
                                                )}
                                            >
                                                WONDER PICK <Zap size={12} className="text-[#c8aa6e]" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* MOCK CARD BACKS */}
                                    <div className="mt-6 flex gap-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="w-12 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center grayscale opacity-30">
                                                <Sparkles size={12} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* DECORATIVE LIGHT */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8aa6e]/2 blur-[40px] rounded-full group-hover:bg-[#c8aa6e]/5 transition-colors" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* SIDEBAR: RANKINGS */}
                    <div className="space-y-8">
                        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                                <Trophy size={18} className="text-[#c8aa6e]" /> LUCK RANKINGS
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { name: 'VoidWalker', hits: 12, rank: 1 },
                                    { name: 'Nova_Stellar', hits: 9, rank: 2 },
                                    { name: 'Kaelthas', hits: 8, rank: 3 }
                                ].map(u => (
                                    <div key={u.name} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs font-black text-[#5c5b57]">0{u.rank}</div>
                                            <div className="text-sm font-bold text-white uppercase">{u.name}</div>
                                        </div>
                                        <div className="text-xs font-black text-[#0ac8b9]">{u.hits} HITS</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link href="/shop" className="block w-full btn-hextech-primary py-6 text-center text-xs font-black uppercase tracking-[0.2em] relative overflow-hidden group">
                            <span className="relative z-10 text-black">OPEN YOUR OWN PACKS</span>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* WONDER PICK OVERLAY */}
            <AnimatePresence>
                {wonderStep !== 'IDLE' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#010a13]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
                    >
                        {wonderStep === 'PICKING' && (
                            <div className="flex flex-col items-center gap-12 max-w-2xl w-full text-center">
                                <header>
                                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">WONDER PICK</h2>
                                    <p className="text-[#a09b8c] text-[10px] font-black uppercase tracking-[0.4em]">CHOOSE ONE HIDDEN CARD FROM {selectedPull?.userName.toUpperCase()}</p>
                                </header>

                                <div className="grid grid-cols-5 gap-4 w-full h-80">
                                    {[0, 1, 2, 3, 4].map(idx => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ scale: 1.05, y: -10 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handlePick(idx)}
                                            className="cursor-pointer group"
                                        >
                                            <div className="w-full h-full bg-[#091428] rounded-2xl border-2 border-white/10 flex flex-col items-center justify-center group-hover:border-[#c8aa6e]/50 transition-all overflow-hidden relative">
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#c8aa6e]/10 to-transparent" />
                                                <Sparkles size={24} className="text-[#c8aa6e] opacity-30 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <button onClick={() => setWonderStep('IDLE')} className="text-[10px] font-black text-[#5c5b57] hover:text-[#c8aa6e] transition-colors uppercase tracking-[0.3em]">Cancel / GO BACK</button>
                            </div>
                        )}

                        {wonderStep === 'REVEALED' && pickedCard && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-12"
                            >
                                <ImmersiveCard card={pickedCard} />
                                <div className="text-center space-y-6">
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">SUCCESSFUL PICK!</h2>
                                    <button
                                        onClick={() => setWonderStep('IDLE')}
                                        className="btn-hextech-primary px-12 py-4 text-sm font-black uppercase text-black"
                                    >
                                        RETURN TO FEED
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
