'use client';

import React, { useState } from 'react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import extensionsData from '@/data/extensions.json';
import { Package, Sparkles, Zap, Lock, Clock, ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';
import clsx from 'clsx';

export default function ShopPage() {
    const { getRefreshedEnergy, boosterEnergy, packHourglasses, useHourglass, pityCounter } = useUserStore();
    const currentEnergy = getRefreshedEnergy();
    const [selectedExp] = useState(extensionsData[0]);
    const [hoveredPack, setHoveredPack] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <EnergyWidget />

            <div className="max-w-6xl mx-auto">
                {/* ENERGY STATUS HUD */}
                <div className="mb-20 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em] mb-1">Booster Energy</h4>
                                <div className="text-4xl font-black text-white font-mono">{currentEnergy} <span className="text-[#5c5b57] text-xl">/ 24</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] font-black text-[#a09b8c] uppercase tracking-widest">NEXT POINT IN</div>
                                <div className="text-xs font-bold text-[#c8aa6e]">44:21</div>
                            </div>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-[#c8aa6e] to-[#f0e6d2] transition-all duration-1000 rounded-full"
                                style={{ width: `${(currentEnergy / 24) * 100}%` }}
                            />
                        </div>
                        {/* DECORATIVE LIGHT */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8aa6e]/5 blur-[50px] rounded-full group-hover:bg-[#c8aa6e]/10 transition-colors" />
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-center">
                        <h4 className="text-[10px] font-black text-[#0ac8b9] uppercase tracking-[0.3em] mb-2">Divine Pity</h4>
                        <div className="flex items-end gap-2">
                            <div className="text-3xl font-black text-white font-mono">{50 - pityCounter}</div>
                            <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest pb-1">to guaranteed hit</div>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-[#c8aa6e]/20 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-center items-center text-center cursor-pointer hover:bg-[#c8aa6e]/10 transition-all group" onClick={useHourglass}>
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="text-[#c8aa6e] group-hover:rotate-12 transition-transform" size={18} />
                            <span className="text-xl font-black text-white">{packHourglasses}</span>
                        </div>
                        <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em]">USE HOURGLASS</h4>
                    </div>
                </div>

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

                                <div className="flex gap-4 w-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                    <Link
                                        href={`/shop/opening?pack=${pack.id}&count=1`}
                                        className={clsx(
                                            "flex-1 btn-hextech py-4 text-xs flex flex-col items-center justify-center gap-1",
                                            currentEnergy < 12 && "opacity-50 grayscale pointer-events-none"
                                        )}
                                    >
                                        <div className="font-black">OPEN 1</div>
                                        <div className="text-[8px] opacity-70 flex items-center gap-1"><Zap size={8} /> 12</div>
                                    </Link>
                                    <Link
                                        href={`/shop/opening?pack=${pack.id}&count=10`}
                                        className={clsx(
                                            "flex-1 btn-hextech-primary py-4 text-xs flex flex-col items-center justify-center gap-1",
                                            currentEnergy < 120 && "opacity-50 grayscale pointer-events-none"
                                        )}
                                    >
                                        <div className="font-black text-black">OPEN 10</div>
                                        <div className="text-[8px] opacity-70 flex items-center gap-1"><Zap size={8} /> 120</div>
                                    </Link>
                                </div>
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
