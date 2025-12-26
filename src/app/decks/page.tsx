'use client';

import Link from 'next/link';
import { Plus, Layers, Library, Trash2, Edit3, Share2, Download } from 'lucide-react';
import React, { useState } from 'react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { getHydratedStarterDecks } from '@/data/starter-decks';
import { useCollectionStore } from '@/store/collection-store';
import { DeckCodeService } from '@/services/deck-code-service';
import { MetaDashboard } from '@/components/dashboard/MetaDashboard';
import clsx from 'clsx';

export default function DecksPage() {
    const { decks, deleteDeck, addDeck } = useCollectionStore();
    const [importCode, setImportCode] = useState('');
    const [showImport, setShowImport] = useState(false);

    const handleImport = () => {
        const cards = DeckCodeService.decode(importCode);
        if (cards.length > 0) {
            addDeck({
                name: `Imported Deck ${new Date().toLocaleDateString()}`,
                cards
            });
            setImportCode('');
            setShowImport(false);
        } else {
            alert("Invalid deck code.");
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 pt-20 md:pt-24 font-serif bg-[#010a13] text-[#f0e6d2] relative overflow-y-auto">
            <EnergyWidget />

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png')] bg-cover bg-center opacity-20 blur-sm fixed" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)] fixed" />

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <header className="mb-8 md:mb-16 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] tracking-widest" style={{ fontFamily: 'Beaufort' }}>
                        THE ARMORY
                    </h1>
                    <p className="mt-2 md:mt-4 text-[#a09b8c] tracking-[0.2em] uppercase text-xs md:text-sm border-t border-b border-[#a09b8c]/30 py-2 inline-block px-4 md:px-8">
                        Management Hub
                    </p>
                </header>

                <div className="mb-12">
                    <MetaDashboard />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Deck */}
                    <Link href="/decks/builder" className="group relative p-8 border border-[#7a5c29]/40 bg-[#091428]/80 backdrop-blur-md rounded-xl hover:bg-[#1e2328] transition-all cursor-pointer shadow-[2px_2px_0_rgba(122,92,41,0.3)] hover:shadow-[0_0_30px_rgba(200,170,110,0.2)] flex flex-col items-center justify-center min-h-[300px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#c8aa6e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-[#c8aa6e]/10 border border-[#c8aa6e] group-hover:bg-[#c8aa6e] group-hover:text-[#010a13] transition-colors">
                                <Plus className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>NEW DECK</h2>
                            <p className="text-[#a09b8c] text-sm">Forge a fresh strategy from scratch.</p>
                        </div>
                    </Link>

                    {/* Import Deck */}
                    <div
                        onClick={() => setShowImport(!showImport)}
                        className="group relative p-8 border border-[#0ac8b9]/40 bg-[#091428]/80 backdrop-blur-md rounded-xl hover:bg-[#1e2328] transition-all cursor-pointer shadow-[2px_2px_0_rgba(10,200,185,0.2)] flex flex-col items-center justify-center min-h-[300px]"
                    >
                        {showImport ? (
                            <div className="w-full space-y-4 relative z-20" onClick={e => e.stopPropagation()}>
                                <h3 className="text-[#0ac8b9] font-bold text-sm tracking-widest uppercase">Import Deck Code</h3>
                                <textarea
                                    value={importCode}
                                    onChange={e => setImportCode(e.target.value)}
                                    placeholder="Paste code here..."
                                    className="w-full h-24 bg-black/60 border border-[#0ac8b9]/30 rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-[#0ac8b9]"
                                />
                                <button onClick={handleImport} className="w-full bg-[#0ac8b9] text-black py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-[#00f2ff] transition-colors">
                                    Analyze & Forge
                                </button>
                            </div>
                        ) : (
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="p-4 rounded-full bg-[#0ac8b9]/10 border border-[#0ac8b9] group-hover:bg-[#0ac8b9] group-hover:text-[#010a13] transition-colors">
                                    <Download className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>IMPORT</h2>
                                <p className="text-[#a09b8c] text-sm">Paste a shared deck code to duplicate.</p>
                            </div>
                        )}
                    </div>

                    {/* Saved Decks */}
                    {decks.map(deck => (
                        <div key={deck.id} className="group relative p-6 border border-white/10 bg-[#091428]/90 backdrop-blur-md rounded-xl hover:border-[#c8aa6e]/40 transition-all flex flex-col shadow-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#c8aa6e]/20 border border-[#c8aa6e]/40 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-[#c8aa6e]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#f0e6d2] uppercase text-lg leading-none" style={{ fontFamily: 'Beaufort' }}>{deck.name}</h3>
                                        <span className="text-[10px] text-[#a09b8c] font-mono">{deck.cards.length} CARDS</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteDeck(deck.id)}
                                    className="p-1.5 rounded-full hover:bg-red-500/20 text-[#a09b8c] hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 mt-2 border-l border-white/5 pl-4 py-2">
                                <div className="flex gap-1">
                                    {/* Small preview bars or something similar */}
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="flex-1 h-8 bg-white/5 rounded-sm overflow-hidden flex flex-col justify-end">
                                            <div className="w-full bg-[#c8aa6e]/40" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Link href={`/decks/builder?id=${deck.id}`} className="flex-1 bg-[#1e2328] border border-white/10 text-[#f0e6d2] py-2 rounded text-[10px] font-bold uppercase tracking-widest text-center hover:bg-[#c8aa6e] hover:text-black transition-all flex items-center justify-center gap-2">
                                    <Edit3 className="w-3 h-3" /> Edit Forge
                                </Link>
                                <button
                                    onClick={() => {
                                        const code = DeckCodeService.encode(deck.cards);
                                        navigator.clipboard.writeText(code);
                                        alert("Deck code copied to clipboard!");
                                    }}
                                    className="p-2 bg-[#1e2328] border border-white/10 text-[#a09b8c] rounded hover:border-[#c8aa6e]/40"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/" className="btn-hextech inline-block">
                        BACK TO HUB
                    </Link>
                </div>
            </div>
        </main>
    );
}
