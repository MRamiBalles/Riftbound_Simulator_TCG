'use client';

import React, { useState } from 'react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import extensionsData from '@/data/extensions.json';
import { Package, Sparkles, Zap, Lock, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ShopPage() {
    const [selectedExp] = useState(extensionsData[0]);
    const [hoveredPack, setHoveredPack] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <EnergyWidget />

            <div className="max-w-6xl mx-auto">
                <header className="mb-16 text-center animate-in fade-in duration-1000">
                    <span className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.5em] mb-4 block">Central Nexus Shop</span>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase leading-none mb-4" style={{ fontFamily: 'Beaufort' }}>
                        BOOSTER STOCKS
                    </h1>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[#0ac8b9] text-[10px] font-black uppercase">
                            <Clock size={12} /> Cycle: Genetic Origins
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="text-[#a09b8c] text-[10px] font-black uppercase">Next Expansion: Celestial War (Soon)</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {selectedExp.packs.map((pack) => (
                        <div
                            key={pack.id}
                            onMouseEnter={() => setHoveredPack(pack.id)}
                            onMouseLeave={() => setHoveredPack(null)}
                            className="relative group h-[500px] rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#c8aa6e]/30 bg-black/40 backdrop-blur-3xl"
                        >
                            {/* PACK VISUAL */}
                            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                                <div
                                    className="w-48 h-72 rounded-[2rem] border-4 mb-8 transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-3 shadow-2xl relative overflow-hidden"
                                    style={{ borderColor: pack.color, boxShadow: `0 0 50px ${pack.color}20` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                        <Package size={80} color={pack.color} />
                                    </div>
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.3em] opacity-50 whitespace-nowrap">Genetic Origins</div>
                                    <div className="absolute bottom-8 left-0 w-full font-black text-xl italic uppercase px-4 truncate">{pack.name}</div>
                                </div>

                                <h3 className="text-2xl font-black text-white uppercase mb-2 group-hover:text-[#c8aa6e] transition-colors">{pack.name}</h3>
                                <p className="text-[10px] text-[#a09b8c] uppercase font-bold tracking-widest mb-6 px-4">{pack.description}</p>

                                <div className="flex gap-2 mb-8">
                                    {pack.featured.map(f => (
                                        <span key={f} className="text-[8px] font-black px-2 py-1 bg-white/5 border border-white/10 rounded-full uppercase tracking-widest">{f}</span>
                                    ))}
                                </div>

                                <Link
                                    href={`/shop/opening?pack=${pack.id}`}
                                    className="btn-hextech w-full py-4 text-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0"
                                >
                                    OPEN BOOSTER <ArrowRight size={16} />
                                </Link>
                            </div>

                            {/* HOVER GLOW */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                                style={{ background: `radial-gradient(circle at center, ${pack.color}, transparent 70%)` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-24 flex items-center justify-center gap-12 border-t border-white/5 pt-12">
                <div className="text-center">
                    <div className="text-2xl font-black text-[#c8aa6e]">12h 44m</div>
                    <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest">NEXT FREE BOOSTER</div>
                </div>
                <div className="w-px h-12 bg-white/5" />
                <button className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 flex items-center justify-center group-hover:bg-[#c8aa6e]/20 transition-all">
                        <Zap size={20} className="text-[#c8aa6e]" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-black text-white uppercase">Use Pack Hourglass</div>
                        <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest">3 IN STOCK</div>
                    </div>
                </button>
            </div>
        </main>
    );
}
