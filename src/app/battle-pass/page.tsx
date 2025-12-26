'use client';

import React, { useState, useEffect } from 'react';
import { useRiftPassStore, PassTier } from '@/store/rift-pass-store';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, CheckCircle, Zap, Sparkles, Crown } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function RiftPassPage() {
    const { xp, level, isPremium, claimedFree, claimedPremium, claimTier, buyPremium } = useRiftPassStore();
    const { addWonderShards, addStarDust } = useUserStore();

    const tiers: PassTier[] = Array.from({ length: 50 }, (_, i) => ({
        level: i + 1,
        freeReward: { type: 'SHARDS', amount: (i + 1) * 5 },
        premiumReward: (i + 1) % 5 === 0 ? { type: 'SLEEVE', amount: 1, id: `sleeve_${i + 1}` } : { type: 'DUST', amount: 500 }
    }));

    const handleClaim = (tier: PassTier, type: 'FREE' | 'PREMIUM') => {
        if (type === 'FREE') {
            if (tier.level > level || claimedFree.includes(tier.level)) return;
            addWonderShards(tier.freeReward.amount);
            claimTier(tier.level, 'FREE');
        } else {
            if (!isPremium || tier.level > level || claimedPremium.includes(tier.level)) return;
            if (tier.premiumReward?.type === 'DUST') addStarDust(tier.premiumReward.amount);
            claimTier(tier.level, 'PREMIUM');
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            RIFT PASS
                        </h1>
                        <p className="text-[#c8aa6e] text-xs font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                            <Crown size={14} /> SEASON 01: DIMENSIONAL BREACH
                        </p>
                    </div>

                    <div className="flex items-center gap-8 bg-black/40 border border-[#c8aa6e]/20 rounded-[2rem] p-6 backdrop-blur-xl">
                        <div className="text-center">
                            <div className="text-[10px] font-black text-[#5c5b57] uppercase mb-1">CURRENT LEVEL</div>
                            <div className="text-3xl font-black text-white">{level}</div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="w-64">
                            <div className="flex justify-between text-[10px] font-black text-[#a09b8c] uppercase mb-2">
                                <span>{xp % 1000} / 1000 XP</span>
                                <span>{Math.floor((xp % 1000) / 10)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#c8aa6e] to-[#f0e6d2]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(xp % 1000) / 10}%` }}
                                />
                            </div>
                        </div>
                        {!isPremium && (
                            <button
                                onClick={buyPremium}
                                className="btn-hextech-primary px-8 py-3 text-[10px] font-black text-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(200,170,110,0.3)]"
                            >
                                UPGRADE PREMIUM
                            </button>
                        )}
                    </div>
                </header>

                <div className="relative">
                    <div className="overflow-x-auto pb-12 scrollbar-hide">
                        <div className="flex gap-4 min-w-max px-4">
                            {tiers.map(tier => (
                                <div key={tier.level} className="w-48 space-y-4">
                                    {/* PREMIUM TRACK */}
                                    <div
                                        onClick={() => handleClaim(tier, 'PREMIUM')}
                                        className={clsx(
                                            "h-48 rounded-3xl border-2 p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden",
                                            !isPremium ? "bg-black/40 border-white/5 grayscale" :
                                                tier.level <= level ? "bg-[#c8aa6e]/20 border-[#c8aa6e] shadow-[0_0_20px_rgba(200,170,110,0.1)]" : "bg-[#c8aa6e]/5 border-[#c8aa6e]/20"
                                        )}
                                    >
                                        {!isPremium && <Lock size={20} className="absolute top-4 right-4 text-[#5c5b57]" />}
                                        {claimedPremium.includes(tier.level) && <CheckCircle size={20} className="absolute top-4 right-4 text-[#0ac8b9]" />}

                                        <div className="text-[10px] font-black text-[#c8aa6e] uppercase mb-3 px-3 py-1 bg-[#c8aa6e]/10 rounded-full">PREMIUM</div>
                                        <div className="w-12 h-12 rounded-full bg-[#c8aa6e]/10 flex items-center justify-center mb-3">
                                            {tier.premiumReward?.type === 'SLEEVE' ? <Sparkles size={24} className="text-[#c8aa6e]" /> : <Star size={24} className="text-[#c8aa6e]" />}
                                        </div>
                                        <div className="text-white font-bold uppercase text-xs">{tier.premiumReward?.type}</div>
                                        <div className="text-[10px] font-black text-[#a09b8c] mt-1">{tier.premiumReward?.amount} UNIT</div>
                                    </div>

                                    {/* LEVEL INDICATOR */}
                                    <div className="flex flex-col items-center py-4 relative">
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10" />
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black relative z-10 transition-all",
                                            tier.level <= level ? "bg-[#c8aa6e] border-white text-black" : "bg-[#091428] border-white/10 text-[#5c5b57]"
                                        )}>
                                            {tier.level}
                                        </div>
                                    </div>

                                    {/* FREE TRACK */}
                                    <div
                                        onClick={() => handleClaim(tier, 'FREE')}
                                        className={clsx(
                                            "h-48 rounded-3xl border-2 p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative",
                                            tier.level <= level ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5"
                                        )}
                                    >
                                        {claimedFree.includes(tier.level) && <CheckCircle size={20} className="absolute bottom-4 right-4 text-[#0ac8b9]" />}
                                        <div className="text-[10px] font-black text-[#5c5b57] uppercase mb-3">FREE</div>
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <Zap size={24} className="text-[#add8e6]" />
                                        </div>
                                        <div className="text-white font-bold uppercase text-xs">{tier.freeReward.type}</div>
                                        <div className="text-[10px] font-black text-[#a09b8c] mt-1">{tier.freeReward.amount} UNIT</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FADE EDGES */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#010a13] to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#010a13] to-transparent pointer-events-none" />
                </div>
            </div>
        </main>
    );
}
