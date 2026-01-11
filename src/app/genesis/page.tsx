'use client';

import React, { useState } from 'react';
import { ChronicleService, LoreEncounter } from '@/services/chronicle-service';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import { BookOpen, Trophy, Swords, Map, ChevronRight, Star, Lock, Play } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function GenesisPage() {
    const encounters = ChronicleService.getEncounters();
    const [selectedId, setSelectedId] = useState<string | null>(encounters[0].id);

    const selected = encounters.find(e => e.id === selectedId);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <HextechNavbar />
            <HextechSidebar />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LEFT: MAP / LIST */}
                <div className="lg:col-span-4 space-y-8">
                    <header>
                        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] uppercase mb-2" style={{ fontFamily: 'Beaufort' }}>
                            GENESIS
                        </h1>
                        <p className="text-[10px] text-[#a09b8c] font-black uppercase tracking-[0.4em] mb-12">Narrative Simulation v5.0</p>
                    </header>

                    <div className="space-y-4">
                        {encounters.map((e, idx) => (
                            <button
                                key={e.id}
                                onClick={() => setSelectedId(e.id)}
                                className={clsx(
                                    "w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group overflow-hidden relative",
                                    selectedId === e.id ? "bg-[#c8aa6e]/10 border-[#c8aa6e]/40 shadow-[0_0_30px_rgba(200,170,110,0.1)]" : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="flex items-center gap-6 z-10">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl font-mono border",
                                        selectedId === e.id ? "bg-[#c8aa6e] text-black border-[#c8aa6e]" : "bg-black/60 text-[#5c5b57] border-white/10"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold uppercase tracking-widest text-white">{e.title}</h3>
                                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#a09b8c]">{e.difficulty} • {e.reward}</div>
                                    </div>
                                </div>
                                <ChevronRight className={clsx("transition-all", selectedId === e.id ? "translate-x-0 opacity-100 text-[#c8aa6e]" : "-translate-x-4 opacity-0")} />

                                {selectedId === e.id && (
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <Map size={80} />
                                    </div>
                                )}
                            </button>
                        ))}

                        {/* LOCKED SLOTS */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full p-6 rounded-2xl border border-white/5 bg-black/20 flex items-center justify-between opacity-30 grayscale cursor-not-allowed">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/60 border border-white/5">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold uppercase tracking-widest text-[#5c5b57]">LOCKED SECTOR</h3>
                                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#5c5b57]">REQUIRES XP LVL {10 + i * 5}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: DETAIL / MISSION BRIEF */}
                <div className="lg:col-span-8 flex flex-col justify-center">
                    {selected ? (
                        <div className="bg-[#091428]/40 border border-[#c8aa6e]/20 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-right duration-500">
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                <BookOpen size={240} />
                            </div>

                            <div className="relative z-10 max-w-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="px-4 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Active Chronicle
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} size={10} className={clsx(i <= 2 ? "text-[#c8aa6e]" : "text-[#5c5b57]")} />
                                        ))}
                                    </div>
                                </div>

                                <h2 className="text-6xl font-black text-white mb-6 uppercase tracking-tight">{selected.title}</h2>
                                <p className="text-xl text-[#f0e6d2] leading-relaxed mb-12 italic opacity-80 font-serif">
                                    "{selected.description}"
                                </p>

                                <div className="grid grid-cols-2 gap-8 mb-12">
                                    <div>
                                        <h4 className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mb-2">Tactical Objective</h4>
                                        <p className="text-sm font-bold text-[#c8aa6e]">{selected.objective}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mb-2">Completion Reward</h4>
                                        <p className="text-sm font-bold text-[#0ac8b9] uppercase">{selected.reward}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <Link
                                        href={`/play?mode=chronicle&id=${selected.id}`}
                                        className="btn-hextech-primary px-12 py-5 text-lg flex items-center gap-3 group"
                                    >
                                        <Play size={20} className="fill-current" />
                                        Infiltrate Sector
                                    </Link>
                                    <button className="text-[10px] font-black text-[#5c5b57] hover:text-[#c8aa6e] uppercase tracking-[0.4em] transition-all">
                                        Lore Archives &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-[#5c5b57] uppercase font-black tracking-widest">Select a Sector to begin simulation</div>
                    )}
                </div>
            </div>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    ABANDON LORE SIMULATION
                </Link>
            </div>
        </main>
    );
}
