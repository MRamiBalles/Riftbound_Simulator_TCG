'use client';

import React, { useEffect, useState } from 'react';
import { getCards } from '@/services/card-service'; // We'll need a client version or pass data
import { Card as CardType } from '@/lib/database.types';
import { Card as CardComponent } from '@/components/Card';
import { useCollectionStore } from '@/store/collection-store';
import EnergyWidget from '@/components/layout/EnergyWidget';
import Link from 'next/link';
import { generateCSV, generateJSON, downloadFile } from '@/services/export-service';
import { Download, FileText, FileCode } from 'lucide-react';
import { MOCK_CARDS } from '@/services/card-service';

export default function CollectionPage() {
    const { inventory, getTotalCards } = useCollectionStore();
    const [filterOwned, setFilterOwned] = useState(false);

    const handleExport = (type: 'csv' | 'json') => {
        if (type === 'csv') {
            const data = generateCSV(inventory, MOCK_CARDS);
            downloadFile(data, `riftbound-collection-${new Date().toISOString().split('T')[0]}.csv`, 'csv');
        } else {
            const data = generateJSON(inventory, MOCK_CARDS);
            downloadFile(data, `riftbound-backup-${new Date().toISOString().split('T')[0]}.json`, 'json');
        }
    };

    // Stats
    const totalVirtual = getTotalCards('VIRTUAL');
    const totalReal = getTotalCards('REAL');

    const filteredCards = filterOwned
        ? MOCK_CARDS.filter(c => (inventory[c.id]?.virtual > 0 || inventory[c.id]?.real > 0))
        : MOCK_CARDS;

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] p-8 pt-24 font-serif">
            <EnergyWidget />

            <header className="mb-12 flex flex-col items-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e]" style={{ fontFamily: 'Beaufort' }}>
                    MY COLLECTION
                </h1>

                <div className="flex gap-8 mt-6 text-sm uppercase tracking-wider">
                    <div className="flex flex-col items-center">
                        <span className="text-[#0ac8b9] font-bold text-2xl">{totalVirtual}</span>
                        <span className="text-[#a09b8c]">Virtual Cards</span>
                    </div>
                    <div className="w-px bg-[#7a5c29]/50" />
                    <div className="flex flex-col items-center">
                        <span className="text-[#c8aa6e] font-bold text-2xl">{totalReal}</span>
                        <span className="text-[#a09b8c]">Real Cards</span>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => setFilterOwned(!filterOwned)}
                        className={`btn-hextech px-6 py-2 text-xs ${filterOwned ? 'bg-[#c8aa6e]/20' : ''}`}
                    >
                        {filterOwned ? 'SHOW ALL CARDS' : 'SHOW ONLY OWNED'}
                    </button>

                    {/* Export Actions */}
                    <button
                        onClick={() => handleExport('csv')}
                        className="btn-hextech px-4 py-2 text-xs flex items-center gap-2"
                        title="Export as CSV (Excel)"
                    >
                        <FileText className="w-4 h-4" />
                        CSV
                    </button>
                    <button
                        onClick={() => handleExport('json')}
                        className="btn-hextech px-4 py-2 text-xs flex items-center gap-2 border-[#0ac8b9] text-[#0ac8b9]"
                        title="Backup as JSON"
                    >
                        <FileCode className="w-4 h-4" />
                        JSON
                    </button>

                    <Link href="/decks" className="btn-hextech px-6 py-2 text-xs">
                        BACK
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 max-w-7xl mx-auto pb-24 px-2">
                {filteredCards.map(card => {
                    const owned = inventory[card.id] || { virtual: 0, real: 0 };
                    const isOwned = owned.virtual > 0 || owned.real > 0;

                    return (
                        <div key={card.id} className={`relative group transform hover:z-10 hover:scale-105 transition-all duration-200 ${!isOwned && !filterOwned ? 'opacity-40 grayscale contrast-125' : ''}`}>
                            <CardComponent card={card} />

                            {/* Quantity Badge - Simplified for Mobile */}
                            <div className="absolute -bottom-2 inset-x-0 flex justify-center gap-1 scale-75 md:scale-100 origin-bottom">
                                {owned.virtual > 0 && (
                                    <div className="bg-[#0ac8b9] text-[#010a13] text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-[#010a13]">
                                        V: {owned.virtual}
                                    </div>
                                )}
                                {owned.real > 0 && (
                                    <div className="bg-[#c8aa6e] text-[#010a13] text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-[#010a13]">
                                        R: {owned.real}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
