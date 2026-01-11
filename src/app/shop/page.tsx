'use client';

import React, { useState } from 'react';
import extensionsData from '@/data/extensions.json';
import { Package, Sparkles, Zap, Lock, Clock, ArrowRight, Trophy, Crown, Box } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import Link from 'next/link';
import clsx from 'clsx';

export default function ShopPage() {
    const { userId } = useUserStore();
    const [selectedExp] = useState(extensionsData[0]);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <HextechNavbar />
            <HextechSidebar />

            <div className="max-w-6xl mx-auto">
                <header className="mb-24 text-center animate-in fade-in duration-1000">
                    <span className="text-[10px] font-black text-[#0ac8b9] uppercase tracking-[0.5em] mb-4 block">Secondary Asset Exchange</span>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase leading-none mb-4" style={{ fontFamily: 'Beaufort' }}>
                        MARKETPLACE
                    </h1>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[#0ac8b9] text-[10px] font-black uppercase">
                            <Box size={12} /> Live Assets: 4,250
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="text-[#c8aa6e] text-[10px] font-black uppercase">Verified Origins Trading: ACTIVE</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="glass-hextech rounded-[3rem] p-12 border border-[#c8aa6e]/20 group hover:bg-[#c8aa6e]/5 transition-all">
                        <Trophy className="text-[#c8aa6e] mb-6" size={32} />
                        <h3 className="text-3xl font-black text-white uppercase mb-4">Trading Hub</h3>
                        <p className="text-[#a09b8c] text-sm leading-relaxed uppercase font-bold tracking-widest mb-8">
                            Exchange scanned physical cards and digital assets with other players.
                            Secure escrow powered by the Aramis Engine.
                        </p>
                        <Link href="/marketplace/trade" className="btn-hextech px-8 py-4 text-xs">ENTER TRADING FLOOR</Link>
                    </div>

                    <div className="glass-hextech rounded-[3rem] p-12 border border-[#0ac8b9]/20 group hover:bg-[#0ac8b9]/5 transition-all">
                        <Package className="text-[#0ac8b9] mb-6" size={32} />
                        <h3 className="text-3xl font-black text-white uppercase mb-4">Bulk Assets</h3>
                        <p className="text-[#a09b8c] text-sm leading-relaxed uppercase font-bold tracking-widest mb-8">
                            Purchase verified bulk collections and starter foundational kits
                            from official Riftbound partners.
                        </p>
                        <Link href="/marketplace/bulk" className="btn-hextech px-8 py-4 text-xs">VIEW BULK LISTINGS</Link>
                    </div>
                </div>

                {/* PREMIUM FOOTER */}
                <div className="bg-gradient-to-r from-transparent via-[#c8aa6e]/10 to-transparent p-12 rounded-3xl text-center">
                    <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.5em] mb-2">Origins Verified Trading</h4>
                    <p className="text-xs text-[#a09b8c] uppercase font-bold tracking-widest">All physical card scans are verified for authenticity via neural fingerprinting.</p>
                </div>
            </div>
        </main>
    );
}
