'use client';

import React, { useState, useEffect } from 'react';
import { RaidService, RaidState } from '@/services/raid-service';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { Sword, Shield, Zap, Users, Trophy, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RaidPage() {
    const [raid, setRaid] = useState<RaidState | null>(null);
    const [myDamage, setMyDamage] = useState(0);

    useEffect(() => {
        RaidService.getActiveRaid().then(setRaid);

        // Simulate real-time updates
        const interval = setInterval(() => {
            RaidService.getActiveRaid().then(setRaid);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!raid) return null;

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <EnergyWidget />

            <div className="max-w-6xl mx-auto flex flex-col items-center">
                <header className="mb-12 text-center animate-in fade-in duration-1000">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                            <AlertTriangle size={12} /> Critical Event Active
                        </div>
                        <div className="flex items-center gap-2 text-[#a09b8c] text-[10px] font-black uppercase tracking-widest">
                            <Users size={14} /> {raid.players.length} RAIDERS ACTIVE
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'Beaufort' }}>
                        {raid.boss.name}
                    </h1>
                </header>

                {/* BOSS VISUAL */}
                <div className="relative w-full max-w-4xl h-96 mb-16 rounded-[4rem] border border-white/10 overflow-hidden bg-black shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)] z-10" />
                    <img
                        src="https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt6d5668e16e6d09e5/62e03399ab625e1140087784/01PZ008-full.png"
                        alt="Boss"
                        className="w-full h-full object-cover opacity-60 animate-pulse-slow grayscale contrast-125"
                    />

                    {/* BOSS HEALTH HUD */}
                    <div className="absolute bottom-0 left-0 w-full p-12 z-20">
                        <div className="flex justify-between items-end mb-4">
                            <div className="text-4xl font-black font-mono text-red-500">{raid.boss.health} <span className="text-red-900 text-xl">/ {raid.boss.maxHealth} HP</span></div>
                            <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-[0.4em]">COLLABORATIVE STRIKE STATUS</div>
                        </div>
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-red-950 via-red-600 to-red-400 transition-all duration-1000"
                                style={{ width: `${(raid.boss.health / raid.boss.maxHealth) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* PLAYERS & PROGRESS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-16">
                    <div className="bg-[#091428]/60 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
                        <Trophy className="text-[#c8aa6e] mb-4" size={24} />
                        <h4 className="text-[10px] font-black text-[#a09b8c] uppercase tracking-widest mb-2">Global Progress</h4>
                        <div className="text-2xl font-black text-[#c8aa6e] font-mono">{raid.globalProgress.toFixed(1)}%</div>
                        <div className="mt-4 text-[8px] text-[#5c5b57] font-bold uppercase leading-relaxed">RARE COSMETICS UNLOCKED AT 100%</div>
                    </div>

                    <div className="bg-[#091428]/60 p-8 rounded-3xl border border-[#0ac8b9]/20 backdrop-blur-xl md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-[#0ac8b9] uppercase tracking-widest">Active Strike Team</h4>
                            <span className="text-[8px] text-[#5c5b57] font-mono uppercase tracking-widest">Live Sync v9.1</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {raid.players.map(p => (
                                <div key={p} className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl text-[10px] font-bold text-[#f0e6d2] flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#0ac8b9] animate-pulse" />
                                    {p}
                                </div>
                            ))}
                            <div className="px-4 py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-[#5c5b57] animate-pulse">
                                + Awaiting Command
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/play?mode=raid" className="btn-hextech-primary px-16 py-6 text-xl flex items-center gap-4">
                        <Sword size={24} /> JOIN GLOBAL FRONT
                    </Link>
                    <button className="text-[10px] font-black text-[#5c5b57] hover:text-[#c8aa6e] transition-all uppercase tracking-[0.4em]">
                        Raid Intel &rarr;
                    </button>
                </div>
            </div>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    WITHDRAW FROM ENGAGEMENT
                </Link>
            </div>
        </main>
    );
}
