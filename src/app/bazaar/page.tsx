'use client';

import React, { useState, useEffect } from 'react';
import { BazaarService, BazaarListing } from '@/services/bazaar-service';
import { Card as CardComponent } from '@/components/Card';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { ShoppingCart, Tag, User, Clock, ArrowLeft, Filter, Zap, Hammer, Gavel } from 'lucide-react';
import { AuctionService, AuctionItem } from '@/services/auction-service';
import Link from 'next/link';
import clsx from 'clsx';

export default function BazaarPage() {
    const [view, setView] = useState<'LISTINGS' | 'TRADES' | 'AUCTION'>('LISTINGS');
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [listings, setListings] = useState<BazaarListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            const data = await BazaarService.getActiveListings();
            setListings(data);
            AuctionService.getActiveAuctions().then(setAuctions);
            setLoading(false);
        };
        fetchListings();
    }, []);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4">
            <EnergyWidget />

            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <Link href="/arena" className="p-3 rounded-full border border-[#c8aa6e]/40 text-[#c8aa6e] hover:bg-[#c8aa6e]/10 transition-all">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] uppercase" style={{ fontFamily: 'Beaufort' }}>
                            The Bazaar
                        </h1>
                        <p className="text-[#a09b8c] text-xs uppercase tracking-[0.4em] mt-1">Peer-to-Peer Trading Floor</p>
                    </div>
                    <button
                        onClick={() => setView('AUCTION')}
                        className={clsx(
                            "text-sm font-black uppercase tracking-[0.3em] pb-4 transition-all relative",
                            view === 'AUCTION' ? "text-[#c8aa6e]" : "text-[#5c5b57] hover:text-[#a09b8c]"
                        )}
                    >
                        Apex Auctions
                        {view === 'AUCTION' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#c8aa6e] shadow-[0_0_10px_#c8aa6e]" />}
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className="bg-black/40 border border-[#0ac8b9]/20 px-6 py-3 rounded-2xl backdrop-blur-md flex items-center gap-3">
                        <Zap className="text-[#0ac8b9] w-5 h-5 fill-[#0ac8b9]/20" />
                        <div>
                            <div className="text-[10px] text-[#0ac8b9]/50 font-bold uppercase tracking-widest">Your Scraps</div>
                            <div className="text-xl font-black text-[#0ac8b9] font-mono">1,250</div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div className="flex gap-6 text-sm font-black uppercase tracking-widest">
                        <button className="text-[#c8aa6e] border-b-2 border-[#c8aa6e] pb-4">Browse Marketplace</button>
                        <button className="text-[#a09b8c] hover:text-[#f0e6d2] transition-colors pb-4">My Listings</button>
                    </div>
                    <button className="flex items-center gap-2 text-xs bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-[#a09b8c]">
                        <Filter size={14} /> Filter & Sort
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-[#c8aa6e]/20 border-t-[#c8aa6e] rounded-full animate-spin" />
                        <span className="text-[#c8aa6e] text-xs font-bold tracking-widest uppercase">Opening Vaults...</span>
                    </div>
                ) : view === 'AUCTION' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {auctions.map(auc => (
                            <div key={auc.id} className="bg-black/60 border border-[#c8aa6e]/30 rounded-3xl p-8 backdrop-blur-3xl animate-in zoom-in duration-500 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 bg-[#c8aa6e] text-black px-4 py-2 text-[8px] font-black uppercase rotate-12 flex items-center gap-1">
                                    <Hammer size={10} /> Live Auction
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-[#091428] rounded-2xl border border-white/10 flex items-center justify-center text-3xl opacity-40">🃏</div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase">{auc.cardName}</h3>
                                        <div className="text-[10px] text-[#a09b8c] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> Ends: {new Date(auc.endTime).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 mb-8 flex justify-between items-center">
                                    <div>
                                        <div className="text-[9px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">CURRENT BID</div>
                                        <div className="text-2xl font-black text-[#c8aa6e] font-mono">{auc.currentBid} BP</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-black text-[#5c5b57] uppercase tracking-widest mb-1">BIDDER</div>
                                        <div className="text-xs font-bold text-white uppercase">{auc.highestBidder}</div>
                                    </div>
                                </div>
                                <button className="w-full btn-hextech-primary py-4 text-sm flex items-center justify-center gap-3">
                                    <Gavel size={18} /> PLACE COUNTER BID
                                </button>
                            </div>
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="bg-[#091428]/40 border border-dashed border-white/10 rounded-3xl py-40 flex flex-col items-center text-center">
                        <Tag className="w-16 h-16 text-[#5c5b57] mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Market is Quiet</h3>
                        <p className="text-[#a09b8c] max-w-md text-sm leading-relaxed mb-8 px-6">
                            There are currently no active listings. Physical and virtual cards are in high demand.
                        </p>
                        <button className="btn-hextech-primary px-8 py-3">List a Card for Sale</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <div key={listing.id} className="bg-[#091428]/80 border border-white/5 rounded-3xl p-6 hover:border-[#c8aa6e]/50 transition-all group">
                                <div className="mb-6 transform group-hover:scale-105 transition-transform">
                                    <CardComponent card={listing.card} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-[#a09b8c]" />
                                            <span className="text-xs font-bold text-[#f0e6d2]">{listing.seller}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-[#0ac8b9]/10 px-2 py-0.5 rounded text-[#0ac8b9] text-[10px] font-black uppercase">
                                            {listing.type}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-[#a09b8c] uppercase font-bold mb-1">Price</span>
                                            <span className="text-2xl font-black text-[#c8aa6e] font-mono">{listing.price} <span className="text-xs">SCRAPS</span></span>
                                        </div>
                                        <button className="bg-[#c8aa6e] text-[#010a13] p-3 rounded-xl hover:shadow-[0_0_20px_rgba(200,170,110,0.4)] transition-all active:scale-95">
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
