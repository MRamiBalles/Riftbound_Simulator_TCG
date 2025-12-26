'use client';

import React, { useState, useEffect } from 'react';
import { TradeService, TradeOffer } from '@/services/trade-service';
import { getCards } from '@/services/card-service';
import { Card } from '@/lib/database.types';
import { ImmersiveCard } from '@/components/cards/ImmersiveCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Plus, Search, Filter, History, Info, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function TradeHubPage() {
    const [trades, setTrades] = useState<TradeOffer[]>([]);
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [activeTab, setActiveTab] = useState<'BROWSE' | 'MY_TRADES'>('BROWSE');

    useEffect(() => {
        setTrades(TradeService.getActiveTrades());
        getCards().then(setAllCards);
    }, []);

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            TRADE HUB
                        </h1>
                        <p className="text-[#add8e6] text-xs font-black uppercase tracking-[0.4em] mt-2 flex items-center justify-center md:justify-start gap-2">
                            <ArrowRightLeft size={14} /> DIMENSIONAL EXCHANGE ENABLED
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="btn-hextech px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Plus size={16} /> NEW OFFER
                        </button>
                        <div className="bg-black/40 border border-white/10 rounded-2xl flex p-1 backdrop-blur-xl">
                            <button
                                onClick={() => setActiveTab('BROWSE')}
                                className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'BROWSE' ? "bg-white/10 text-white" : "text-[#5c5b57]")}
                            >
                                Browse
                            </button>
                            <button
                                onClick={() => setActiveTab('MY_TRADES')}
                                className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'MY_TRADES' ? "bg-white/10 text-white" : "text-[#5c5b57]")}
                            >
                                My Trades
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {trades.length > 0 ? trades.map((trade, idx) => (
                            <motion.div
                                key={trade.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-black/60 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl group hover:border-[#c8aa6e]/30 transition-all relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-[8px] font-black text-[#a09b8c] uppercase tracking-widest mb-1">OFFERED BY</div>
                                        <div className="text-sm font-bold text-white uppercase">{trade.ownerName}</div>
                                    </div>
                                    <div className="px-3 py-1 bg-[#0ac8b9]/10 border border-[#0ac8b9]/30 rounded-full text-[8px] font-black text-[#0ac8b9] uppercase tracking-widest">
                                        ACTIVE
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 mb-8">
                                    <div className="w-32">
                                        <ImmersiveCard card={trade.offeringCard} size="sm" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <ArrowRightLeft size={24} className="text-[#c8aa6e] animate-pulse" />
                                        <span className="text-[10px] font-black text-[#5c5b57] uppercase tracking-tighter">FOR</span>
                                    </div>
                                    <div className="w-32 h-44 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                                        <Search size={24} className="text-[#5c5b57] mb-2" />
                                        <span className="text-[8px] font-black text-[#5c5b57] uppercase tracking-[0.2em]">ANY LEGENDARY</span>
                                    </div>
                                </div>

                                <button className="w-full btn-hextech-primary py-4 text-[10px] font-black uppercase tracking-[0.2em] relative overflow-hidden group/btn">
                                    <span className="relative z-10 text-black">ACCEPT TRADE</span>
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-0 transition-transform" />
                                </button>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent -skew-x-12 translate-x-16 -translate-y-16" />
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center">
                                <History size={64} className="text-[#5c5b57] mx-auto mb-6 opacity-20" />
                                <h4 className="text-xl font-black text-[#5c5b57] uppercase tracking-widest">No Active Trades</h4>
                                <p className="text-sm text-[#5c5b57] mt-2 italic px-12">The market is quiet. Be the first to dimensionally shift your collection.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
