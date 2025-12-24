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
import { MOCK_CARDS, MOCK_SETS } from '@/services/card-service';
import clsx from 'clsx';

export default function CollectionPage() {
    const { inventory, getTotalCards } = useCollectionStore();
    const [filterOwned, setFilterOwned] = useState(false);
    const [selectedSet, setSelectedSet] = useState<string | 'ALL'>('ALL');

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
    const totalValue = MOCK_CARDS.reduce((acc, card) => {
        const owned = inventory[card.id];
        if (owned) {
            return acc + ((owned.virtual + owned.real) * (card.market_price || 0));
        }
        return acc;
    }, 0);

    const filteredCards = MOCK_CARDS.filter(card => {
        const owned = inventory[card.id];
        const hasCopy = owned && (owned.virtual > 0 || owned.real > 0);

        if (filterOwned && !hasCopy) return false;
        if (selectedSet !== 'ALL' && card.set_id !== selectedSet) return false;

        return true;
    });

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif">
            <EnergyWidget />

            {/* Header */}
            <header className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-[#091428] to-[#010a13] border-b border-[#7a5c29]">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e]" style={{ fontFamily: 'Beaufort' }}>
                    COLLECTION
                </h1>

                <div className="flex justify-center gap-8 mt-4 text-sm tracking-widest uppercase">
                    <div className="flex flex-col items-center">
                        <span className="text-[#0ac8b9] font-bold text-xl">{totalVirtual}</span>
                        <span className="text-[#5c5b57]">Virtual</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[#c8aa6e] font-bold text-xl">{totalReal}</span>
                        <span className="text-[#5c5b57]">Real (Scanned)</span>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    {/* Set Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setSelectedSet('ALL')}
                            className={clsx(
                                "px-3 py-1 text-xs rounded-full border transition-all",
                                selectedSet === 'ALL' ? "bg-[#c8aa6e] text-black border-[#c8aa6e]" : "border-[#7a5c29] text-[#7a5c29] hover:border-[#c8aa6e]"
                            )}
                        >
                            ALL SETS
                        </button>
                        {MOCK_SETS.map(set => (
                            <button
                                key={set.id}
                                onClick={() => setSelectedSet(set.id)}
                                className={clsx(
                                    "px-3 py-1 text-xs rounded-full border transition-all",
                                    selectedSet === set.id ? "bg-[#0ac8b9] text-black border-[#0ac8b9]" : "border-[#7a5c29] text-[#7a5c29] hover:border-[#0ac8b9]"
                                )}
                            >
                                {set.code}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
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
