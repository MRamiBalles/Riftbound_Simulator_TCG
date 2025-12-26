'use client';

import React, { useState, useEffect } from 'react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { Tv, Play, Users, MessageSquare, Coins, Trophy, Zap, Radio } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function RiftboundTVPage() {
    const [isAwaitingBet, setIsAwaitingBet] = useState(true);
    const [viewers, setViewers] = useState(1242);

    useEffect(() => {
        const interval = setInterval(() => {
            setViewers(prev => prev + Math.floor(Math.random() * 10) - 5);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <EnergyWidget />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LEFT: LIVE STREAM AREA */}
                <div className="lg:col-span-8 space-y-8">
                    <header className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <Radio className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">RIFTBOUND TV</h1>
                                <p className="text-[10px] text-[#a09b8c] font-black uppercase tracking-[0.4em]">APEX SUMMONER LEAGUE // LIVE</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-red-500" /> LIVE
                            </div>
                            <div className="text-[#a09b8c] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} /> {viewers.toLocaleString()} VIEWERS
                            </div>
                        </div>
                    </header>

                    {/* MOCK STREAM WINDOW */}
                    <div className="relative aspect-video bg-black rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                        {/* THE SIMULATION */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src="https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt909873995f5bd7c1/5db0a59fbd244a6ab0664ee0/01DE001-full.png"
                                alt="Simulation"
                                className="w-64 h-auto transform perspective-1000 rotate-y-12 animate-float"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-black text-[12vw] select-none pointer-events-none">
                                NEURAL_CORE
                            </div>
                        </div>

                        {/* OVERLAY DATA */}
                        <div className="absolute bottom-0 left-0 w-full p-12 z-20 flex justify-between items-end">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest">NEXT MATCH</div>
                                <div className="text-2xl font-black text-white uppercase italic">ELDER DRAGON vs THE VOID WALKER</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#c8aa6e] text-black flex items-center justify-center font-black text-xs">AI</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-[#a09b8c]">Neural Efficiency: 99.4%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-[#091428]/60 p-8 rounded-3xl border border-[#c8aa6e]/20">
                            <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest mb-4">MATCH ANALYTICS</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-bold text-[#a09b8c]">WIN RATE PREDICTION</span>
                                    <span className="text-xs font-black text-[#0ac8b9]">64% DRAGON</span>
                                </div>
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-bold text-[#a09b8c]">AGGRESSION INDEX</span>
                                    <span className="text-xs font-black text-amber-500">EXCESSIVE</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#091428]/60 p-8 rounded-3xl border border-[#0ac8b9]/20 flex flex-col justify-center items-center text-center">
                            <Zap className="text-[#0ac8b9] mb-4" size={32} />
                            <h4 className="text-[10px] font-black text-[#0ac8b9] uppercase tracking-widest mb-2">NEURAL TRAINING MODE</h4>
                            <p className="text-[10px] text-[#a09b8c] leading-relaxed">Watching Apex matches contributes +5% XP to your own Neural Bot development.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: BETTING & CHAT */}
                <div className="lg:col-span-4 space-y-8 flex flex-col h-full">
                    {/* BETTING PANEL */}
                    <div className="bg-black/40 border border-[#c8aa6e]/40 rounded-3xl p-8 shadow-[0_0_30px_rgba(200,170,110,0.1)]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em] flex items-center gap-2">
                                <Coins size={14} /> Apex Predictions
                            </h3>
                            <div className="text-[10px] font-black text-white">320 SHARDS</div>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full p-6 bg-[#091428] border border-white/10 rounded-2xl flex items-center justify-between hover:border-[#c8aa6e] transition-all group">
                                <div className="text-left">
                                    <div className="text-[8px] font-black text-[#a09b8c] uppercase mb-1">TEAM ALPHA</div>
                                    <div className="text-sm font-black text-white uppercase group-hover:text-[#c8aa6e]">DRAGON LORD</div>
                                </div>
                                <div className="text-[10px] font-mono text-[#5c5b57]">1.82x</div>
                            </button>
                            <button className="w-full p-6 bg-[#091428] border border-white/10 rounded-2xl flex items-center justify-between hover:border-[#0ac8b9] transition-all group">
                                <div className="text-left">
                                    <div className="text-[8px] font-black text-[#a09b8c] uppercase mb-1">TEAM OMEGA</div>
                                    <div className="text-sm font-black text-white uppercase group-hover:text-[#0ac8b9]">VOID WALKER</div>
                                </div>
                                <div className="text-[10px] font-mono text-[#5c5b57]">2.45x</div>
                            </button>
                        </div>

                        <p className="mt-8 text-[8px] text-[#5c5b57] text-center font-black uppercase tracking-widest">Winnings are paid in Wonder Shards</p>
                    </div>

                    {/* LIVE CHAT AREA */}
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-xl min-h-[400px]">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <div className="text-[9px] font-black text-[#5c5b57] uppercase tracking-[0.3em] flex items-center gap-2">
                                <MessageSquare size={12} /> Live Discussion
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-[11px] font-bold">
                            <div className="text-[#c8aa6e]"><span className="text-[#a09b8c] opacity-50 mr-2">[Lv.44]</span> RiftWalker: insane lethality on that play</div>
                            <div className="text-[#f0e6d2]"><span className="text-[#a09b8c] opacity-50 mr-2">[Lv.12]</span> ShadowBlade: void walker winrate is fake news</div>
                            <div className="text-[#0ac8b9]"><span className="text-[#a09b8c] opacity-50 mr-2">[MOD]</span> System AI: Predicting match outcome in 30s...</div>
                        </div>
                        <div className="p-4 bg-white/5">
                            <input
                                type="text"
                                placeholder="SEND MESSAGE..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[9px] font-black text-[#f0e6d2] focus:outline-none placeholder-[#5c5b57]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    EXIT SPECTATOR TERMINAL
                </Link>
            </div>
        </main>
    );
}
