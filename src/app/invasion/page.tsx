'use client';

import React, { useState, useEffect } from 'react';
import { InvasionService, WorldBoss } from '@/services/invasion-service';
import { VfxService } from '@/services/vfx-service';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Target, Timer, Trophy, ShoppingBag, Swords, Info } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function InvasionPage() {
    const [boss, setBoss] = useState<WorldBoss | null>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [contribution, setContribution] = useState(0);
    const [theftLog, setTheftLog] = useState<string[]>([]);
    const [rankings, setRankings] = useState(InvasionService.getSeasonRankings());

    useEffect(() => {
        setBoss(InvasionService.getBoss());
        setContribution(InvasionService.getPersonalContribution());
        setRankings(InvasionService.getSeasonRankings());

        const timer = setInterval(() => {
            const b = InvasionService.getBoss();
            const diff = b.endsAt - Date.now();
            if (diff > 0) {
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleAssault = () => {
        const baseDamage = Math.floor(Math.random() * 5000) + 2000;
        const result = InvasionService.recordDamage(baseDamage);

        VfxService.trigger(result.stolen ? 'CRITICAL_HIT' : 'PACK_OPEN');
        if (result.stolen) {
            setTheftLog(prev => [`CARD STOLEN BY ${result.stolen}! -15% POWER`, ...prev].slice(0, 3));
        }

        setBoss({ ...InvasionService.getBoss() });
        setContribution(InvasionService.getPersonalContribution());
        setRankings(InvasionService.getSeasonRankings());
    };

    const hpPercentage = boss ? (boss.currentHp / boss.totalHp) * 100 : 0;
    const stolenCount = InvasionService.getStolenCount();

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            {/* DARK VOID OVERLAY */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 animate-pulse">
                        <ShieldAlert size={12} /> GLOBAL EMERGENCY: THE VOID MONARCH DETECTED
                    </div>
                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                        FINAL INVASION
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* BOSS VISUAL & HP (COL 7) */}
                    <div className="lg:col-span-7 space-y-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: stolenCount > 0 ? [0, -2, 2, -2, 0] : 0
                            }}
                            transition={{
                                x: { repeat: Infinity, duration: 0.1 },
                                scale: { duration: 0.5 }
                            }}
                            className="relative aspect-video max-w-2xl mx-auto group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent rounded-full blur-[120px] animate-pulse" />
                            <div className="w-full h-full border-4 border-red-500/20 rounded-[4rem] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl relative overflow-hidden">
                                <motion.div
                                    animate={{
                                        y: [0, -30, 0],
                                        rotate: stolenCount > 0 ? [0, 5, -5, 0] : 0
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="relative"
                                >
                                    <Swords size={180} className={clsx(
                                        "text-purple-600 drop-shadow-[0_0_50px_rgba(168,85,247,0.7)]",
                                        stolenCount > 2 && "sepia brightness-150 animate-pulse"
                                    )} />
                                </motion.div>

                                {stolenCount > 0 && (
                                    <div className="absolute top-8 left-8 flex flex-col items-center gap-2">
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">STOLEN CARDS</div>
                                        <div className="flex -space-x-4">
                                            {Array.from({ length: stolenCount }).map((_, i) => (
                                                <div key={i} className="w-8 h-12 bg-red-900/50 border border-red-500 rounded-md rotate-12 animate-bounce" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                            <div className="flex justify-between items-end mb-4">
                                <div className="text-xs font-black text-[#c8aa6e] uppercase tracking-widest">WORLD HP</div>
                                <div className="text-3xl font-black text-white font-mono">{boss?.currentHp.toLocaleString()}</div>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${hpPercentage}%` }}
                                    className="h-full bg-gradient-to-r from-red-600 to-purple-800"
                                />
                            </div>
                        </div>

                        {/* THEFT LOG */}
                        <div className="h-20 overflow-hidden space-y-2">
                            <AnimatePresence mode="popLayout">
                                {theftLog.map((log, i) => (
                                    <motion.div
                                        key={i + log}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[10px] font-black text-red-400 uppercase tracking-tighter bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30"
                                    >
                                        ⚠️ {log}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* STATS & RANKINGS (COL 5) */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                                <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">YOUR DAMAGE</div>
                                <div className="text-2xl font-black text-white">{contribution.toLocaleString()}</div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl border-red-500/20">
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">PENALTY</div>
                                <div className="text-2xl font-black text-white">-{stolenCount * 15}%</div>
                            </div>
                        </div>

                        {/* HALL OF FAME */}
                        <div className="bg-gradient-to-b from-[#c8aa6e]/10 to-black/60 border border-[#c8aa6e]/30 rounded-[2.5rem] p-8 backdrop-blur-xl">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                                <Trophy size={18} className="text-[#c8aa6e]" /> HALL OF FAME
                            </h3>
                            <div className="space-y-4">
                                {rankings.map(u => (
                                    <div key={u.name} className={clsx(
                                        "flex justify-between items-center p-4 rounded-2xl border transition-all",
                                        u.name === 'MasterPlayer' ? "bg-[#c8aa6e]/20 border-[#c8aa6e]/40 scale-105" : "bg-white/5 border-white/5"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-black text-[#c8aa6e]">0{u.rank}</div>
                                            <div>
                                                <div className="text-sm font-bold text-white uppercase">{u.name}</div>
                                                <div className="text-[8px] font-black text-[#a09b8c] uppercase tracking-widest">{u.title}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-[#0ac8b9]">{u.points.toLocaleString()}</div>
                                            <div className="text-[8px] font-black text-[#5c5b57] uppercase">CPS</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAssault}
                            className="w-full btn-hextech-primary py-8 text-md font-black uppercase tracking-[0.4em] relative overflow-hidden group shadow-[0_0_50px_rgba(200,170,110,0.2)]"
                        >
                            <span className="relative z-10 text-black">LAUNCH ASSAULT</span>
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide {
                    from { background-position: 0 0; }
                    to { background-position: 50px 0; }
                }
            `}</style>
        </main>
    );
}
