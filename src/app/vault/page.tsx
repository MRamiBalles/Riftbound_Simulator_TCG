'use client';

import React from 'react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { BookOpen, Share2, Star, LayoutGrid, Heart, Search, Filter } from 'lucide-react';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { useSocialStore } from '@/store/social-store';
import Link from 'next/link';

export default function VaultPage() {
    // Mock user collection for preview
    const mockCollection = Array.from({ length: 8 }, (_, i) => ({
        id: `card-${i}`,
        name: i % 2 === 0 ? 'Lux: Final Spark' : 'Garen: Judgement',
        cost: 6,
        type: 'Unit' as const,
        subtypes: ['Demacia'],
        region: 'Demacia',
        rarity: 'Legendary' as const,
        text: 'The ultimate showcase card.',
        image_url: i % 2 === 0 ? 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/bltb968846c243881ca/5db0a5a3bd244a6ab0664ee6/01DE042-full.png' : 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/bltc5d4c8f041697268/5db0a5a0bd244a6ab0664ee2/01DE012-full.png',
        set_id: 'CORE',
        collector_number: '001'
    }));

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <EnergyWidget />

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in slide-in-from-top duration-700">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="text-[#c8aa6e]" size={24} />
                            <span className="text-[10px] font-black text-[#a09b8c] uppercase tracking-[0.4em]">Personal Archives</span>
                        </div>
                        <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            THE VAULT
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <button className="btn-hextech px-8 py-3 flex items-center gap-2">
                            <Share2 size={16} /> Share Collection
                        </button>
                        <button className="btn-hextech-primary px-8 py-3 flex items-center gap-2">
                            <LayoutGrid size={16} /> Manage Display
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* FILTERS */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest mb-6">Mastery Filter</h4>
                            <div className="space-y-4">
                                {['Immersive', 'Prismatic', 'Golden', 'Standard'].map(f => (
                                    <label key={f} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-4 h-4 rounded border border-white/20 group-hover:border-[#c8aa6e] transition-all" />
                                        <span className="text-xs font-bold text-[#a09b8c] group-hover:text-white">{f}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/20 p-8 rounded-3xl">
                            <Star className="text-[#c8aa6e] mb-4" size={24} />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Vault Statistics</h4>
                            <div className="space-y-1">
                                <div className="text-[10px] text-[#a09b8c] uppercase font-bold">LEGENDARY CARDS: 44</div>
                                <div className="text-[10px] text-[#a09b8c] uppercase font-bold">HOLO_STARS EARNED: 1,290</div>
                            </div>
                        </div>
                    </div>

                    {/* GRID */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {mockCollection.map(card => (
                                <div key={card.id} className="animate-in fade-in zoom-in duration-500">
                                    <ImmersiveCard card={card as any} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    EXIT ARCHIVES
                </Link>
            </div>
        </main>
    );
}
