'use client';

import React, { useState, useEffect } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { MOCK_CARDS } from '@/services/card-service';
import { Card as CardComponent } from '@/components/Card';
import { Loader2, ArrowRightLeft, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import EnergyWidget from '@/components/layout/EnergyWidget';

// Mock Trade Partners
const PARTNERS = [
    { id: 'p1', name: 'Faker', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/588.png', lookingFor: 'Mid Laners' },
    { id: 'p2', name: 'Tyler1', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/6.png', lookingFor: 'Noxus Units' },
    { id: 'p3', name: 'K/DA Fan', avatar: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/3587.png', lookingFor: 'Skins' },
];

export default function TradePage() {
    const { inventory, addCard, removeCard } = useCollectionStore();
    const [step, setStep] = useState<'PARTNER' | 'OFFER' | 'CONFIRM' | 'SUCCESS'>('PARTNER');
    const [selectedPartner, setSelectedPartner] = useState<any>(null);
    const [partnerOffer, setPartnerOffer] = useState<any>(null); // Card they give YOU
    const [myOffer, setMyOffer] = useState<string | null>(null); // Card YOU give them
    const [tradeStamina, setTradeStamina] = useState(1); // Mock daily limit

    // Get owned cards
    const ownedCards = MOCK_CARDS.filter(c => {
        const entry = inventory[c.id];
        return entry && entry.virtual > 0; // Can only trade Virtual cards
    }).slice(0, 12); // Limit for demo

    const handleSelectPartner = (partner: any) => {
        if (tradeStamina < 1) return;
        setSelectedPartner(partner);
        // Bot generates an offer (random card you don't have ideally, but random for now)
        const randomCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
        setPartnerOffer(randomCard);
        setStep('OFFER');
    };

    const handleSelectMyOffer = (cardId: string) => {
        setMyOffer(cardId);
        setStep('CONFIRM');
    };

    const executeTrade = () => {
        if (!selectedPartner || !partnerOffer || !myOffer) return;

        // 1. Remove my card
        removeCard(myOffer, 'VIRTUAL');
        // 2. Add partner's card
        addCard(partnerOffer.id, 'VIRTUAL');

        setTradeStamina(0);
        setStep('SUCCESS');
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] p-4 md:p-8 pt-20 font-serif relative overflow-y-auto">
            <EnergyWidget />

            <header className="mb-8 text-center">
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#a020f0] via-[#f0e6d2] to-[#a020f0]" style={{ fontFamily: 'Beaufort' }}>
                    BLACK MARKET
                </h1>
                <p className="mt-2 text-[#a09b8c] text-sm">Safe trading zone. Swap duplicates. No scams.</p>

                <div className="mt-4 inline-flex items-center gap-2 bg-[#1e2328] px-4 py-1 rounded-full border border-[#7a5c29]">
                    <span className="text-[#a09b8c] text-xs uppercase">Trade Stamina:</span>
                    <div className="flex gap-1">
                        <div className={clsx("w-3 h-3 rounded-full", tradeStamina > 0 ? "bg-[#0ac8b9] shadow-[0_0_5px_#0ac8b9]" : "bg-gray-800")} />
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                {/* STEP 1: SELECT PARTNER */}
                {step === 'PARTNER' && (
                    <div className="grid gap-4">
                        {tradeStamina < 1 && (
                            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-center text-red-300 mb-4">
                                <Lock className="inline-block w-4 h-4 mr-2" />
                                You have run out of Trade Stamina. Come back tomorrow.
                            </div>
                        )}

                        {PARTNERS.map(partner => (
                            <div
                                key={partner.id}
                                onClick={() => handleSelectPartner(partner)}
                                className={clsx(
                                    "bg-[#091428] border border-[#7a5c29] p-4 rounded-xl flex items-center gap-4 transition-all",
                                    tradeStamina > 0 ? "cursor-pointer hover:bg-[#1e2328] hover:scale-[1.01]" : "opacity-50 grayscale cursor-not-allowed"
                                )}
                            >
                                <img src={partner.avatar} alt={partner.name} className="w-16 h-16 rounded-full border-2 border-[#c8aa6e]" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl">{partner.name}</h3>
                                    <p className="text-[#0ac8b9] text-sm">Looking for: {partner.lookingFor}</p>
                                </div>
                                <ArrowRightLeft className="text-[#c8aa6e]" />
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 2: SELECT MY OFFER */}
                {step === 'OFFER' && (
                    <div className="animate-in slide-in-from-right">
                        <div className="flex items-center justify-between mb-6 bg-[#1e2328] p-4 rounded-xl border border-[#0ac8b9]/30">
                            <div className="text-center">
                                <span className="text-xs uppercase text-[#a09b8c]">Partner Offers</span>
                                <div className="w-24 mt-2">
                                    <CardComponent card={partnerOffer} />
                                </div>
                            </div>
                            <ArrowRightLeft className="w-8 h-8 text-[#f0e6d2]" />
                            <div className="text-center">
                                <span className="text-xs uppercase text-[#a09b8c]">You Give</span>
                                <div className="w-24 h-32 mt-2 border-2 border-dashed border-[#7a5c29] rounded flex items-center justify-center bg-[#010a13]">
                                    <span className="text-xs text-[#7a5c29]">Select Below</span>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-[#c8aa6e] font-bold mb-4">Select a card to trade:</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {ownedCards.map(card => (
                                <div key={card.id} onClick={() => handleSelectMyOffer(card.id)} className="cursor-pointer hover:scale-105 transition-transform">
                                    <CardComponent card={card} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: CONFIRM */}
                {step === 'CONFIRM' && partnerOffer && myOffer && (
                    <div className="flex flex-col items-center animate-in zoom-in text-center">
                        <h2 className="text-2xl font-bold mb-8">CONFIRM TRADE?</h2>

                        <div className="flex items-center gap-8 mb-8">
                            <div className="transform scale-110">
                                <CardComponent card={MOCK_CARDS.find(c => c.id === myOffer) || MOCK_CARDS[0]} />
                                <p className="mt-2 text-red-400 text-sm font-bold">- LOSING</p>
                            </div>
                            <ArrowRightLeft className="w-12 h-12 text-[#c8aa6e] animate-pulse" />
                            <div className="transform scale-110">
                                <CardComponent card={partnerOffer} />
                                <p className="mt-2 text-[#0ac8b9] text-sm font-bold">+ GAINING</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep('OFFER')} className="btn-hextech">CANCEL</button>
                            <button onClick={executeTrade} className="btn-hextech-primary">CONFIRM TRADE</button>
                        </div>
                    </div>
                )}

                {/* SUCCESS */}
                {step === 'SUCCESS' && (
                    <div className="bg-[#0ac8b9]/10 border border-[#0ac8b9] p-8 rounded-xl text-center animate-in zoom-in">
                        <CheckCircle className="w-16 h-16 text-[#0ac8b9] mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-[#f0e6d2]">TRADE SUCCESSFUL</h2>
                        <p className="text-[#a09b8c] mt-2">The items have been transferred.</p>

                        <div className="mt-8">
                            <Link href="/collection" className="btn-hextech">VIEW COLLECTION</Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
