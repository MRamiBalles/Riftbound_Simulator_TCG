'use client';

import React, { useState, useEffect } from 'react';
import { BazaarService, BazaarListing } from '@/services/bazaar-service';
import { Card as CardComponent } from '@/components/Card';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { ShoppingCart, Tag, User, Clock, ArrowLeft, Filter, Zap, Hammer, Gavel, Trophy, TrendingUp, ShieldCheck } from 'lucide-react';
import { AuctionService, AuctionItem } from '@/services/auction-service';
import { PointStrategyService } from '@/services/point-strategy-service';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';

export default function BazaarPage() {
    const [view, setView] = useState<'LISTINGS' | 'TRADES' | 'AUCTION'>('AUCTION');
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [listings, setListings] = useState<BazaarListing[]>([]);
    const [loading, setLoading] = useState(true);
    const { prestigePoints } = useUserStore();

    useEffect(() => {
        const fetchMarket = async () => {
            const [bazaarData, auctionData] = await Promise.all([
                BazaarService.getActiveListings(),
                AuctionService.getActiveAuctions()
            ]);
            setListings(bazaarData);
            setAuctions(auctionData);
            setLoading(false);
        };
        fetchMarket();
    }, []);

    const loyaltyTier = PointStrategyService.getTier(prestigePoints);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <HextechNavbar />
            <HextechSidebar />

            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#a09b8c] hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </Link>
                            <span className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.5em]">Global Trade Hub</span>
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            SOVEREIGN <br /> <span className="text-[#c8aa6e]">BAZAAR</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-gradient-to-br from-black/60 to-transparent border border-[#0ac8b9]/30 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-[#0ac8b9]/10 border border-[#0ac8b9]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trophy className="text-[#0ac8b9]" size={24} />
                            </div>
                            <div>
                                <div className="text-[8px] font-black text-[#0ac8b9] uppercase tracking-widest">{loyaltyTier.title}</div>
                                <div className="text-2xl font-black text-white font-mono">{prestigePoints.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* NAVIGATION & FILTERS */}
                <nav className="flex items-center justify-between mb-12 pb-4 border-b border-white/5">
                    <div className="flex gap-12">
                        {[
                            { id: 'AUCTION', label: 'Apex Auctions', icon: Gavel },
                            { id: 'LISTINGS', label: 'Marketplace', icon: Tag },
                            { id: 'TRADES', label: 'Direct Trades', icon: TrendingUp }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as any)}
                                className={clsx(
                                    "flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] transition-all pb-4 relative",
                                    view === item.id ? "text-[#c8aa6e]" : "text-[#5c5b57] hover:text-[#a09b8c]"
                                )}
                            >
                                <item.icon size={16} />
                                {item.label}
                                {view === item.id && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute bottom-0 left-0 w-full h-1 bg-[#c8aa6e] shadow-[0_0_15px_#c8aa6e]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="btn-hextech px-6 py-2 text-[10px] flex items-center gap-2">
                            <Filter size={14} /> FILTER VAULT
                        </button>
                        <button className="btn-hextech-primary px-6 py-2 text-[10px] text-black">
                            CREATE LISTING
                        </button>
                    </div>
                </nav>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-40 gap-6"
                        >
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-[#c8aa6e]/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-[#c8aa6e] rounded-full border-t-transparent animate-spin" />
                            </div>
                            <span className="text-[#c8aa6e] text-xs font-black tracking-[0.4em] uppercase">Synchronizing Ledger...</span>
                        </motion.div>
                    ) : view === 'AUCTION' ? (
                        <motion.div
                            key="auction"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                        >
                            {auctions.map((auc) => (
                                <div key={auc.id} className="relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-br from-[#c8aa6e]/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative bg-black/60 border border-white/5 hover:border-[#c8aa6e]/30 p-10 rounded-[3rem] backdrop-blur-3xl transition-all duration-500 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8aa6e]/5 blur-[80px] -z-10 group-hover:bg-[#c8aa6e]/10 transition-colors" />

                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.4em] mb-1">Live Auction</div>
                                                <div className="flex items-center gap-2 text-[#a09b8c] text-[8px] font-black uppercase">
                                                    <ShieldCheck size={10} className="text-[#0ac8b9]" /> Verified Asset
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-[#c8aa6e]/10 border border-[#c8aa6e]/20 rounded-full flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-[8px] font-black text-[#c8aa6e] uppercase tracking-widest">LIVE</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mb-10 transform scale-90 group-hover:scale-100 transition-transform duration-700">
                                            {/* We use ImmersiveCard for premium items */}
                                            <ImmersiveCard card={{ id: auc.cardId, name: auc.cardName, rarity: auc.rarity as any, image_url: auc.image_url, type: 'Unit', mana_cost: 0, power: 0, health: 0, abilities: [] } as any} />
                                        </div>

                                        <div className="bg-black/80 rounded-3xl p-6 border border-white/5 space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">CURRENT BID</div>
                                                    <div className="text-3xl font-black text-white font-mono">{auc.currentBid.toLocaleString()} <span className="text-[#c8aa6e] text-xs">BP</span></div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">TIME REMAINING</div>
                                                    <div className="text-xl font-black text-[#0ac8b9] font-mono">02:44:12</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-[10px] text-[#a09b8c] font-black uppercase">
                                                <User size={12} /> HIGHEST BIDDER: <span className="text-white">{auc.highestBidder}</span>
                                            </div>

                                            <button className="w-full btn-hextech-primary py-5 text-xs font-black uppercase tracking-[0.2em] group">
                                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                                                PLACE COUNTER BID
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="listings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {listings.map((listing) => (
                                <div key={listing.id} className="group relative bg-[#091428]/60 border border-white/5 hover:border-[#c8aa6e]/40 rounded-[2.5rem] p-6 backdrop-blur-xl transition-all duration-300 flex flex-col items-center">
                                    <div className="absolute top-4 right-4 bg-[#0ac8b9]/10 px-2 py-0.5 rounded text-[#0ac8b9] text-[8px] font-black uppercase tracking-widest border border-[#0ac8b9]/20">
                                        {listing.type}
                                    </div>

                                    <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500 w-full flex justify-center">
                                        <ImmersiveCard card={listing.card} size="sm" className="scale-75" />
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <User size={12} className="text-[#a09b8c]" />
                                                </div>
                                                <span className="text-[10px] font-bold text-[#f0e6d2]">{listing.seller}</span>
                                            </div>
                                            <div className="text-[8px] text-[#5c5b57] font-black uppercase tracking-widest">
                                                {new Date(listing.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end border-t border-white/5 pt-4 px-2">
                                            <div>
                                                <span className="text-[8px] text-[#a09b8c] uppercase font-black tracking-widest mb-1 block">Asking Price</span>
                                                <span className="text-xl font-black text-[#c8aa6e] font-mono">{listing.price.toLocaleString()} <span className="text-[10px]">SCRAPS</span></span>
                                            </div>
                                            <button className="bg-[#c8aa6e] text-[#010a13] p-3 rounded-2xl hover:shadow-[0_0_20px_rgba(200,170,110,0.4)] transition-all active:scale-95">
                                                <ShoppingCart size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="mt-40 border-t border-white/5 pt-20 max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <div>
                        <div className="text-4xl font-black text-white">4.2M</div>
                        <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">24H VOLUME</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-[#0ac8b9]">+12.4%</div>
                        <div className="text-[8px] font-black text-[#5c5b57] uppercase tracking-widest">MARKET INDEX</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-white uppercase tracking-[0.4em]">SOVEREIGN NETWORK</div>
                    <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.2em] mt-1 italic">Authorized Trading Floor</div>
                </div>
            </footer>
        </main>
    );
}
