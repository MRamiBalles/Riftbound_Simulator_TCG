import Link from 'next/link';
import { Plus, Layers, Library } from 'lucide-react';
import React from 'react';
import EnergyWidget from '@/components/layout/EnergyWidget';
import { getHydratedStarterDecks } from '@/data/starter-decks';

export default function DecksPage() {
    const starterDecks = getHydratedStarterDecks();

    return (
        <main className="min-h-screen p-4 md:p-8 pt-20 md:pt-24 font-serif bg-[#010a13] text-[#f0e6d2] relative overflow-y-auto">
            <EnergyWidget />

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png')] bg-cover bg-center opacity-20 blur-sm fixed" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)] fixed" />

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <header className="mb-8 md:mb-16 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] tracking-widest" style={{ fontFamily: 'Beaufort' }}>
                        DECK BUILDER
                    </h1>
                    <p className="mt-2 md:mt-4 text-[#a09b8c] tracking-[0.2em] uppercase text-xs md:text-sm border-t border-b border-[#a09b8c]/30 py-2 inline-block px-4 md:px-8">
                        Forge Your Legend
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    {/* Create New Deck */}
                    <Link href="/decks/builder" className="group relative p-8 border border-[#7a5c29] bg-[#091428]/80 backdrop-blur-md rounded-xl hover:bg-[#1e2328] transition-all cursor-pointer shadow-[0_0_0_1px_#000,0_0_0_2px_#463714] hover:shadow-[0_0_20px_rgba(200,170,110,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#c8aa6e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-[#c8aa6e]/10 border border-[#c8aa6e] group-hover:bg-[#c8aa6e] group-hover:text-[#010a13] transition-colors">
                                <Plus className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>NEW DECK</h2>
                            <p className="text-[#a09b8c] text-sm">Start from scratch and build a new strategy.</p>
                        </div>
                    </Link>

                    {/* My Decks */}
                    <div className="group relative p-8 border border-[#7a5c29] bg-[#091428]/80 backdrop-blur-md rounded-xl hover:bg-[#1e2328] transition-all cursor-pointer shadow-[0_0_0_1px_#000,0_0_0_2px_#463714] hover:shadow-[0_0_20px_rgba(200,170,110,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0ac8b9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-[#0ac8b9]/10 border border-[#0ac8b9] group-hover:bg-[#0ac8b9] group-hover:text-[#010a13] transition-colors">
                                <Layers className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>MY DECKS</h2>
                            <p className="text-[#a09b8c] text-sm">View and edit your existing creations.</p>
                        </div>
                    </div>

                    {/* Collection */}
                    <Link href="/collection" className="group relative p-8 border border-[#7a5c29] bg-[#091428]/80 backdrop-blur-md rounded-xl hover:bg-[#1e2328] transition-all cursor-pointer shadow-[0_0_0_1px_#000,0_0_0_2px_#463714] hover:shadow-[0_0_20px_rgba(200,170,110,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e9ec5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-[#1e9ec5]/10 border border-[#1e9ec5] group-hover:bg-[#1e9ec5] group-hover:text-[#010a13] transition-colors">
                                <Library className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>COLLECTION</h2>
                            <p className="text-[#a09b8c] text-sm">Browse all cards in your library.</p>
                        </div>
                    </Link>
                </div>

                <div className="mt-16 text-center">
                    <Link href="/" className="btn-hextech inline-block">
                        BACK TO HOME
                    </Link>
                </div>
            </div>
        </main>
    );
}
