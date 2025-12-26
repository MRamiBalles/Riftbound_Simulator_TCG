'use client';

import React, { useState, useEffect } from 'react';
import { ArenaService, ArenaRun } from '@/services/arena-service';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Trophy, Zap, Plus, Info, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useUserStore } from '@/store/user-store';

export default function ArenaPage() {
    const [run, setRun] = useState<ArenaRun | null>(null);
    const [draftOptions, setDraftOptions] = useState<Card[]>([]);
    const [allCards, setAllCards] = useState<Card[]>([]);
    const { addWonderShards } = useUserStore();

    useEffect(() => {
        getCards().then(setAllCards);
        setRun(ArenaService.getRun());
    }, []);

    const handleStart = () => {
        const newRun = ArenaService.startRun();
        setRun(newRun);
        setDraftOptions(ArenaService.getDraftOptions(allCards));
    };

    const handlePick = (card: Card) => {
        if (!run) return;
        run.deck.push(card.id);
        run.currentDraftIndex++;

        if (run.deck.length >= 30) {
            run.status = 'PLAYING';
        } else {
            setDraftOptions(ArenaService.getDraftOptions(allCards));
        }
        setRun({ ...run });
    };

    const handleMatch = (isWin: boolean) => {
        const result = ArenaService.recordResult(isWin);
        if (result?.status === 'FINISHED' && result.wins >= 3) {
            addWonderShards(50);
        }
        setRun(result ? { ...result } : null);
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden flex flex-col items-center">
            <div className="max-w-7xl w-full">
                {!run && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-12 text-center mt-20">
                        <header>
                            <h1 className="text-8xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'Beaufort' }}>ARENA</h1>
                            <p className="text-[#0ac8b9] text-sm font-black uppercase tracking-[0.5em] mt-4">SURVIVE THE GAUNTLET</p>
                        </header>
                        <div className="bg-black/60 border border-white/5 p-12 rounded-[3rem] backdrop-blur-3xl max-w-xl">
                            <ul className="space-y-6 text-left mb-12">
                                <li className="flex gap-4 items-start">
                                    <div className="p-3 bg-white/5 rounded-xl"><Plus size={20} className="text-[#c8aa6e]" /></div>
                                    <div><p className="font-bold text-white uppercase">DRAFT YOUR DECK</p><p className="text-xs text-[#5c5b57] mt-1">Pick 1 of 3 cards until you reach 30. No collection needed.</p></div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="p-3 bg-white/5 rounded-xl"><Trophy size={20} className="text-[#0ac8b9]" /></div>
                                    <div><p className="font-bold text-white uppercase">3 WINS = VICTORY</p><p className="text-xs text-[#5c5b57] mt-1">Survive until 3 wins. 2 losses and you are out.</p></div>
                                </li>
                            </ul>
                            <button onClick={handleStart} className="w-full btn-hextech-primary py-6 text-md font-black uppercase tracking-[0.2em] relative overflow-hidden group shadow-[0_0_50px_rgba(200,170,110,0.2)]">
                                <span className="relative z-10 text-black">ENTER FOR 500 SHARDS</span>
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {run?.status === 'DRAFTING' && (
                    <div className="flex flex-col items-center gap-16">
                        <header className="text-center">
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">DRAFTING PHASE</h2>
                            <p className="text-[#c8aa6e] text-[10px] font-black uppercase mt-2 tracking-[0.3em]">PROGRESS: {run.deck.length} / 30 CARDS</p>
                        </header>
                        <div className="flex gap-12">
                            {draftOptions.map((card, idx) => (
                                <motion.div key={`${card.id}-${idx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} onClick={() => handlePick(card)} className="cursor-pointer group">
                                    <div className="relative group-hover:scale-105 transition-all duration-500">
                                        <div className="absolute -inset-4 bg-gradient-to-t from-[#c8aa6e]/0 to-[#c8aa6e]/20 opacity-0 group-hover:opacity-100 rounded-[2.5rem] blur-xl" />
                                        <ImmersiveCard card={card} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {run?.status === 'PLAYING' && (
                    <div className="flex flex-col items-center gap-20 mt-12">
                        <div className="grid grid-cols-3 gap-12 w-full max-w-4xl">
                            <div className="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-center backdrop-blur-xl">
                                <div className="text-[10px] font-black text-[#0ac8b9] uppercase tracking-widest mb-2">VICTORIES</div>
                                <div className="text-5xl font-black text-white flex justify-center gap-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Trophy key={i} size={32} className={i < run.wins ? "text-[#0ac8b9]" : "text-[#5c5b57] opacity-20"} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-4 border-[#c8aa6e]/20 flex items-center justify-center bg-[#c8aa6e]/5 animate-pulse">
                                    <Sword size={40} className="text-[#c8aa6e]" />
                                </div>
                            </div>
                            <div className="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-center backdrop-blur-xl">
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">DEFEATS</div>
                                <div className="text-5xl font-black text-white flex justify-center gap-4">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className={clsx("w-8 h-8 rounded-full border-2", i < run.losses ? "bg-red-500/20 border-red-500" : "bg-white/5 border-white/10")} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-8">
                            <button onClick={() => handleMatch(true)} className="px-16 py-6 bg-[#0ac8b9]/20 border border-[#0ac8b9]/40 rounded-2xl font-black uppercase text-[#0ac8b9] hover:bg-[#0ac8b9]/30 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(10,200,185,0.1)]">
                                <CheckCircle /> SIMULATE WIN
                            </button>
                            <button onClick={() => handleMatch(false)} className="px-16 py-6 bg-red-500/20 border border-red-500/40 rounded-2xl font-black uppercase text-red-500 hover:bg-red-500/30 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                <XCircle /> SIMULATE LOSS
                            </button>
                        </div>
                    </div>
                )}

                {run?.status === 'FINISHED' && (
                    <div className="flex flex-col items-center gap-12 mt-20 text-center">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-12 bg-black/60 border border-[#c8aa6e]/30 rounded-[3rem] backdrop-blur-3xl">
                            <Trophy size={80} className={run.wins >= 3 ? "text-[#c8aa6e] mx-auto mb-8 animate-bounce" : "text-[#5c5b57] mx-auto mb-8"} />
                            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">RUN COMPLETE</h2>
                            <div className="text-2xl font-black text-[#c8aa6e] mb-12">{run.wins} WINS - {run.losses} LOSSES</div>
                            <button onClick={() => setRun(null)} className="w-full btn-hextech-primary py-6 text-xs font-black uppercase tracking-[0.3em] text-black">CLAIM REWARDS & EXIT</button>
                        </motion.div>
                    </div>
                )}
            </div>
        </main>
    );
}
