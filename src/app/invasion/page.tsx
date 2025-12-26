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

    useEffect(() => {
        setBoss(InvasionService.getBoss());
        setContribution(InvasionService.getPersonalContribution());

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

    const hpPercentage = boss ? (boss.currentHp / boss.totalHp) * 100 : 0;

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            {/* DARK VOID OVERLAY */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 animate-pulse">
                        <ShieldAlert size={12} /> GLOBAL EMERGENCY: THE VOID Monarch DETECTED
                    </div>
                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                        FINAL INVASION
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* BOSS VISUAL & HP */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative aspect-square max-w-md mx-auto group"
                        >
                            {/* BOSS PSEUDO-SPRITE */}
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent rounded-full blur-[80px] animate-pulse" />
                            <div className="w-full h-full border-4 border-white/5 rounded-[4rem] flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl relative overflow-hidden">
                                <motion.div
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="relative"
                                >
                                    <Swords size={120} className="text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]" />
                                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                                </motion.div>
                                <div className="absolute bottom-12 text-center w-full px-8">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{boss?.name}</h2>
                                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.4em]">{boss?.title}</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-xs font-black text-[#c8aa6e] uppercase tracking-widest">WORLD PROGRESS</div>
                                <div className="text-2xl font-black text-white font-mono">{boss?.currentHp.toLocaleString()} <span className="text-[#5c5b57] text-lg">/ {boss?.totalHp.toLocaleString()} HP</span></div>
                            </div>
                            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${hpPercentage}%` }}
                                    className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-red-600 rounded-full relative"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:50px_50px] animate-[slide_1s_linear_infinite]" />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* RAID COMMANDS */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-4 text-[#add8e6]">
                                    <Timer size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">TIME REMAINING</span>
                                </div>
                                <div className="text-3xl font-black text-white font-mono">{timeLeft || '--:--:--'}</div>
                            </div>
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-4 text-[#0ac8b9]">
                                    <Trophy size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">YOUR DAMAGE</span>
                                </div>
                                <div className="text-3xl font-black text-white font-mono">{contribution.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-[2.5rem] p-10 backdrop-blur-xl">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                                <Info size={18} className="text-purple-400" /> ACTIVE ABILITIES
                            </h3>
                            <div className="space-y-6">
                                {boss?.abilities.map(a => (
                                    <div key={a.name} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                                            <ShieldAlert size={18} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white uppercase">{a.name}</div>
                                            <div className="text-xs text-[#a09b8c] mt-1">{a.effect}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    VfxService.trigger('CRITICAL_HIT');
                                    InvasionService.recordDamage(Math.floor(Math.random() * 5000) + 1000);
                                    setBoss(InvasionService.getBoss());
                                }}
                                className="flex-1 btn-hextech-primary py-6 text-sm font-black uppercase tracking-[0.3em] group relative overflow-hidden"
                            >
                                <span className="relative z-10 text-black">LAUNCH ASSAULT</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                            </button>
                            <Link href="/shop" className="btn-hextech px-8 py-6 text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                <ShoppingBag size={20} /> REWARD SHOP
                            </Link>
                        </div>
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
