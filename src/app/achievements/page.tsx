'use client';

import React, { useState } from 'react';
import { useAchieveStore, Achievement } from '@/store/achievement-store';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Award, CheckCircle2, Trophy, Sparkles, Zap, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export default function AchievementBookPage() {
    const { achievements, claimReward } = useAchieveStore();
    const { addWonderShards, addPackHourglasses } = useUserStore();
    const [activeTab, setActiveTab] = useState<Achievement['category']>('COLLECTION');
    const [page, setPage] = useState(0);

    const filtered = achievements.filter(a => a.category === activeTab);
    const tabs: Achievement['category'][] = ['COLLECTION', 'PULLS', 'SOCIAL'];

    const handleClaim = (a: Achievement) => {
        if (claimReward(a.id)) {
            if (a.reward.type === 'SHARDS') addWonderShards(a.reward.amount);
            // etc
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden flex items-center justify-center">
            {/* BOOK CONTAINER */}
            <div className="max-w-6xl w-full h-[800px] bg-[#091428] border-8 border-[#c8aa6e]/20 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row">

                {/* LEFT SIDE: TABS / COVER DECOR */}
                <div className="w-full md:w-1/4 bg-black/60 border-r border-[#c8aa6e]/10 p-12 flex flex-col gap-8">
                    <div className="mb-12">
                        <Book className="text-[#c8aa6e] mb-4" size={48} />
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">WORLD<br />RECORDS</h1>
                        <div className="h-1 w-12 bg-[#c8aa6e] mt-4" />
                    </div>

                    <div className="space-y-4">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPage(0); }}
                                className={clsx(
                                    "w-full text-left px-6 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all",
                                    activeTab === tab ? "bg-[#c8aa6e] text-black shadow-[0_0_20px_#c8aa6e50]" : "text-[#5c5b57] hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: PAGES */}
                <div className="flex-1 p-16 relative bg-[radial-gradient(circle_at_center,rgba(200,170,110,0.05)_0%,transparent_100%)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <header className="mb-12 flex justify-between items-end">
                                <div>
                                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{activeTab} ARCHIVES</h2>
                                    <p className="text-[#a09b8c] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Milestones reached in your odyssey</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest">CHAPTER PROGRESS</div>
                                    <div className="text-2xl font-black text-[#c8aa6e]">{filtered.filter(a => a.claimed).length} / {filtered.length}</div>
                                </div>
                            </header>

                            <div className="flex-1 space-y-4 overflow-y-auto pr-4">
                                {filtered.map((a, idx) => {
                                    const isComplete = a.current >= a.target;
                                    return (
                                        <div
                                            key={a.id}
                                            className={clsx(
                                                "p-8 rounded-3xl border transition-all relative overflow-hidden group",
                                                a.claimed ? "bg-black/20 border-white/5 opacity-50" : isComplete ? "bg-[#c8aa6e]/10 border-[#c8aa6e] shadow-[0_0_30px_#c8aa6e10]" : "bg-white/5 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className={clsx(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                                        isComplete ? "bg-[#c8aa6e] text-black border-[#c8aa6e]" : "bg-white/5 text-[#5c5b57] border-white/10"
                                                    )}>
                                                        {a.claimed ? <CheckCircle2 size={24} /> : <Award size={24} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{a.title}</h4>
                                                        <p className="text-xs text-[#a09b8c] font-medium">{a.description}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    {a.claimed ? (
                                                        <span className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest">CLAIMED</span>
                                                    ) : isComplete ? (
                                                        <button
                                                            onClick={() => handleClaim(a)}
                                                            className="btn-hextech px-6 py-2 text-[10px] font-black uppercase text-black bg-[#c8aa6e]"
                                                        >
                                                            CLAIM REWARD
                                                        </button>
                                                    ) : (
                                                        <div className="text-right">
                                                            <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">PROGRESS</div>
                                                            <div className="text-sm font-black text-white">{a.current} / {a.target}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* REWARD TOAST */}
                                            {!a.claimed && (
                                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">REWARD:</span>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-[#c8aa6e]">
                                                        {a.reward.type === 'SHARDS' && <Sparkles size={10} />}
                                                        {a.reward.type === 'ENERGY' && <Zap size={10} />}
                                                        {a.reward.badgeId && <Award size={10} />}
                                                        {a.reward.amount > 0 ? `${a.reward.amount} ${a.reward.type}` : a.reward.badgeId}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* DECORATIVE RINGS */}
                <div className="absolute left-[25%] top-0 bottom-0 w-8 flex flex-col justify-around py-12 pointer-events-none z-20 hidden md:flex">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-16 h-4 bg-gradient-to-r from-black/80 to-transparent border-y border-[#c8aa6e]/20 -ml-4 rounded-r-full" />
                    ))}
                </div>
            </div>
        </main>
    );
}
