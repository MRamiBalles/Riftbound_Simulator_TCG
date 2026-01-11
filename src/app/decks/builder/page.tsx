'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_CARDS } from '@/services/card-service';
import { useCollectionStore } from '@/store/collection-store';
import { Card as CardComponent } from '@/components/Card';
import { NameGenService } from '@/services/namegen-service';
import { MetaService } from '@/services/meta-service';
import { VfxService } from '@/services/vfx-service';
import { Search, AlertTriangle, CheckCircle, Copy, Save, Share2, CornerUpLeft, Plus, Wand2 } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import { ManaCurveChart } from '@/components/deck-builder/ManaCurveChart';
import { DeckCodeService } from '@/services/deck-code-service';
import { CloudService } from '@/services/cloud-service';

export default function DeckBuilderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const deckId = searchParams.get('id');
    const metaId = searchParams.get('meta');

    const { inventory, setActiveDeck, decks, addDeck, updateDeck } = useCollectionStore();

    // Initial state from existing deck OR meta deck template
    const [deck, setDeck] = useState<Record<string, number>>(() => {
        if (deckId) {
            const existing = decks.find(d => d.id === deckId);
            if (existing) {
                const counts: Record<string, number> = {};
                existing.cards.forEach(id => counts[id] = (counts[id] || 0) + 1);
                return counts;
            }
        }
        if (metaId) {
            const meta = MetaService.getMetaDecks().find(m => m.id === metaId);
            if (meta) {
                const counts: Record<string, number> = {};
                meta.coreCards.forEach(id => counts[id] = 3); // Pre-fill 3 of each core card
                return counts;
            }
        }
        return {};
    });

    const [deckName, setDeckName] = useState(() => {
        if (deckId) return decks.find(d => d.id === deckId)?.name || 'New deck';
        if (metaId) return MetaService.getMetaDecks().find(m => m.id === metaId)?.name || 'Meta Deck';
        return 'New deck';
    });

    const [search, setSearch] = useState('');
    const [selectedSet, setSelectedSet] = useState<string>('all');
    const [selectedRarity, setSelectedRarity] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    // Filter cards for library
    const library = useMemo(() => {
        return MOCK_CARDS.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
            const matchesSet = selectedSet === 'all' || (c as any).set_name === selectedSet || (c as any).set_code === selectedSet;
            const matchesRarity = selectedRarity === 'all' || c.rarity === selectedRarity;
            const matchesType = selectedType === 'all' || c.type === selectedType;
            return matchesSearch && matchesSet && matchesRarity && matchesType;
        }).slice(0, 100); // Limit to 100 for performance
    }, [search, selectedSet, selectedRarity, selectedType]);

    const deckSize = Object.values(deck).reduce((a, b) => a + b, 0);

    const handleSave = async () => {
        const cardList: string[] = [];
        Object.entries(deck).forEach(([id, count]) => {
            for (let i = 0; i < count; i++) cardList.push(id);
        });

        const code = DeckCodeService.encode(cardList);

        // Background Cloud Sync - No await to avoid blocking UI redirection
        CloudService.saveDeck('local-user', {
            name: deckName,
            code: code,
            description: `Deck created on ${new Date().toLocaleDateString()}`
        }).catch(err => console.warn('[DeckBuilder] Cloud sync failed, using local fallback.', err));

        if (deckId) {
            updateDeck(deckId, cardList);
        } else {
            addDeck({ name: deckName, cards: cardList });
        }
        router.push('/decks');
    };

    const handleExport = () => {
        const cardList: string[] = [];
        Object.entries(deck).forEach(([id, count]) => {
            for (let i = 0; i < count; i++) cardList.push(id);
        });
        const code = DeckCodeService.encode(cardList);
        navigator.clipboard.writeText(code);
        alert("Deck code copied to clipboard!");
    };

    // Add card to deck (max 3 copies)
    const addCard = (cardId: string) => {
        if (deckSize >= 40) return;
        setDeck(prev => ({
            ...prev,
            [cardId]: Math.min((prev[cardId] || 0) + 1, 3)
        }));
    };

    // Remove card from deck
    const removeCard = (cardId: string) => {
        setDeck(prev => {
            const count = prev[cardId];
            if (!count) return prev;
            if (count === 1) {
                const { [cardId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [cardId]: count - 1 };
        });
    };

    // Validate Deck against Inventory
    const validationIssues = Object.entries(deck).map(([cardId, requiredCount]) => {
        const totalOwned = inventory[cardId] || 0;
        if (totalOwned < requiredCount) {
            return { cardId, missing: requiredCount - totalOwned };
        }
        return null;
    }).filter(Boolean);

    const handleGenerateName = () => {
        const regions = Array.from(new Set(
            Object.keys(deck).map(id => MOCK_CARDS.find(c => c.id === id)?.region).filter(Boolean)
        )) as string[];

        const newName = NameGenService.generate(regions);
        setDeckName(newName);
        VfxService.trigger('CRITICAL_HIT');
    };

    const isValid = deckSize === 40 && validationIssues.length === 0;

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif flex flex-col pt-20 overflow-hidden">
            <HextechNavbar />
            <HextechSidebar />

            {/* Header */}
            <header className="bg-[#091428] border-b border-[#7a5c29] p-4 flex justify-between items-center shadow-lg z-20">
                <div className="flex items-center gap-6">
                    <Link href="/decks" className="p-2 hover:bg-white/5 rounded-full text-[#a09b8c] transition-colors">
                        <CornerUpLeft className="w-5 h-5" />
                    </Link>
                    <div className="relative group">
                        <input
                            type="text"
                            value={deckName}
                            onChange={e => setDeckName(e.target.value)}
                            className="bg-transparent text-xl font-bold bg-clip-text text-[#c8aa6e] border-b border-[#c8aa6e]/0 hover:border-[#c8aa6e]/30 focus:border-[#c8aa6e] outline-none transition-all uppercase tracking-widest"
                            style={{ fontFamily: 'Beaufort' }}
                        />
                        <button
                            onClick={handleGenerateName}
                            className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-[#c8aa6e]/50 hover:text-[#c8aa6e] transition-colors opacity-0 group-hover:opacity-100"
                            title="Generate AI Name"
                        >
                            <Wand2 size={16} />
                        </button>
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">({deckSize}/40)</span>
                </div>

                <div className="flex gap-4">
                    <div className={clsx(
                        "hidden md:flex items-center gap-2 px-4 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase",
                        isValid ? "border-[#0ac8b9] text-[#0ac8b9] bg-[#0ac8b9]/10" : "border-amber-500/50 text-amber-500/80 bg-amber-900/10"
                    )}>
                        {isValid ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {isValid ? "READY TO FORGE" : deckSize === 40 ? "INVENTORY ERROR" : "INCOMPLETE"}
                    </div>

                    <button
                        onClick={handleExport}
                        className="p-2 bg-[#1e2328] border border-[#7a5c29]/30 text-[#a09b8c] rounded hover:text-[#c8aa6e] transition-colors"
                        title="Export Code"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleSave}
                        className="btn-hextech px-8 py-1.5 text-xs flex items-center gap-2 font-black shadow-[0_0_20px_rgba(200,170,110,0.2)]"
                    >
                        <Save className="w-4 h-4" /> {deckId ? 'UPDATE FORGE' : 'SAVE TO ARMORY'}
                    </button>

                    <button
                        onClick={() => {
                            const deckList: string[] = [];
                            Object.entries(deck).forEach(([id, count]) => {
                                for (let i = 0; i < count; i++) deckList.push(id);
                            });
                            setActiveDeck(deckList);
                            router.push('/play');
                        }}
                        className={clsx(
                            "px-8 py-1.5 text-xs font-black rounded bg-blue-600 text-white hover:bg-blue-500 transition-all uppercase tracking-widest",
                            deckSize === 0 && "opacity-50 grayscale pointer-events-none"
                        )}
                    >
                        VIRTUAL TEST
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: LIBRARY */}
                <div className="flex-1 flex flex-col border-r border-[#7a5c29]/30 bg-[#010a13]/50 backdrop-blur">
                    <div className="p-4 border-b border-[#7a5c29]/30 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09b8c]" />
                            <input
                                type="text"
                                placeholder="Search cards in library..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#1e2328] border border-[#7a5c29]/30 rounded py-2 pl-10 pr-4 text-sm text-[#f0e6d2] focus:outline-none focus:border-[#c8aa6e]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={selectedSet}
                                onChange={(e) => setSelectedSet(e.target.value)}
                                className="bg-[#1e2328] border border-[#7a5c29]/30 text-[10px] uppercase font-black text-[#a09b8c] rounded px-3 outline-none focus:border-[#c8aa6e]"
                            >
                                <option value="all">Set: All</option>
                                <option value="Origins">Origins</option>
                                <option value="Spiritforged">Spiritforged</option>
                                <option value="Proving Grounds">Proving Grounds</option>
                            </select>

                            <select
                                value={selectedRarity}
                                onChange={(e) => setSelectedRarity(e.target.value)}
                                className="bg-[#1e2328] border border-[#7a5c29]/30 text-[10px] uppercase font-black text-[#a09b8c] rounded px-3 outline-none focus:border-[#c8aa6e]"
                            >
                                <option value="all">Rarity: All</option>
                                <option value="Common">Common</option>
                                <option value="Rare">Rare</option>
                                <option value="Epic">Epic</option>
                                <option value="Champion">Champion</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4 content-start">
                        {library.map(card => {
                            const totalOwned = inventory[card.id] || 0;
                            const inDeck = deck[card.id] || 0;

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => addCard(card.id)}
                                    className="relative group cursor-pointer hover:scale-[1.02] transition-transform"
                                >
                                    <CardComponent card={card} />
                                    {/* Inventory Badge */}
                                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] border border-[#7a5c29] font-mono">
                                        {totalOwned} OWNED
                                    </div>
                                    {/* In Deck Badge */}
                                    {inDeck > 0 && (
                                        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                                            <div className="bg-[#0ac8b9] text-black px-4 py-1 rounded shadow-[0_0_20px_#0ac8b9] font-black text-xl">
                                                {inDeck}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: DECK LIST */}
                <div className="w-80 md:w-96 bg-[#091428] flex flex-col border-l border-[#c8aa6e]/30 shadow-2xl">
                    <div className="p-4 bg-[#1e2328] border-b border-[#c8aa6e]/30 flex items-center justify-between">
                        <h2 className="text-[#c8aa6e] font-black uppercase tracking-widest text-xs">Deck Blueprint</h2>
                        <span className="text-[10px] font-mono text-[#a09b8c]">{deckSize}/40</span>
                    </div>

                    <div className="px-4 py-3 bg-black/20">
                        <ManaCurveChart deck={deck} cards={MOCK_CARDS} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {Object.entries(deck).length === 0 ? (
                            <div className="text-center text-[#a09b8c] mt-20 italic flex flex-col items-center gap-4">
                                <Plus className="w-12 h-12 opacity-10" />
                                <span className="text-xs uppercase tracking-[0.2em] opacity-40">Blueprints Empty</span>
                            </div>
                        ) : Object.entries(deck).map(([cardId, count]) => {
                            const card = MOCK_CARDS.find(c => c.id === cardId)!;
                            const totalOwned = inventory[cardId] || 0;
                            const missing = Math.max(0, count - totalOwned);

                            return (
                                <div
                                    key={cardId}
                                    className={clsx(
                                        "group flex items-center gap-3 p-2 rounded border bg-[#010a13]/50 hover:bg-[#1e2328]/80 transition-all",
                                        missing > 0 ? "border-red-500/50 shadow-[inset_4px_0_0_#ef4444]" : "border-white/5"
                                    )}
                                >
                                    <div
                                        className="w-10 h-10 rounded bg-cover bg-center border border-white/10"
                                        style={{ backgroundImage: `url(${card.image_url})` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate text-sm uppercase" style={{ fontFamily: 'Beaufort' }}>{card.name}</div>
                                        <div className="text-[10px] font-mono text-[#a09b8c] uppercase">{card.cost} MANA</div>
                                    </div>

                                    {missing > 0 && (
                                        <div className="text-red-400 text-[10px] font-black uppercase px-2 py-0.5 bg-red-950/40 border border-red-500/50 rounded animate-pulse">
                                            NOT OWNED
                                        </div>
                                    )}

                                    <div className="flex items-center bg-black/40 rounded border border-white/5">
                                        <button onClick={() => removeCard(cardId)} className="w-6 h-8 flex items-center justify-center hover:bg-red-500/20 text-[#a09b8c]">-</button>
                                        <span className="w-6 text-center text-xs font-black text-[#c8aa6e]">{count}</span>
                                        <button onClick={() => addCard(cardId)} className="w-6 h-8 flex items-center justify-center hover:bg-[#0ac8b9]/20 text-[#a09b8c]">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Footer */}
                    <div className="p-6 bg-[#1e2328] border-t border-[#c8aa6e]/30 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-[#a09b8c] uppercase tracking-widest">
                                <span>Champion Slots</span>
                                <span className={clsx(
                                    Object.entries(deck).filter(([id]) => MOCK_CARDS.find(c => c.id === id)?.rarity === 'Champion').reduce((a, [_, c]) => a + c, 0) > 6 ? "text-red-400" : "text-[#c8aa6e]"
                                )}>
                                    {Object.entries(deck).filter(([id]) => MOCK_CARDS.find(c => c.id === id)?.rarity === 'Champion').reduce((a, [_, c]) => a + c, 0)} / 6
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-[#010a13] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#7a5c29] to-[#c8aa6e] transition-all duration-500"
                                    style={{ width: `${(deckSize / 40) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px] font-black text-[#a09b8c] uppercase tracking-widest">
                            <div className="p-2 bg-black/40 rounded border border-white/5 flex flex-col items-center">
                                <span className="text-white text-lg leading-none mb-1">
                                    {Object.entries(deck).filter(([id]) => MOCK_CARDS.find(c => c.id === id)?.type === 'Unit').reduce((a, [_, c]) => a + c, 0)}
                                </span>
                                UNITS
                            </div>
                            <div className="p-2 bg-black/40 rounded border border-white/5 flex flex-col items-center">
                                <span className="text-white text-lg leading-none mb-1">
                                    {Object.entries(deck).filter(([id]) => MOCK_CARDS.find(c => c.id === id)?.type === 'Spell').reduce((a, [_, c]) => a + c, 0)}
                                </span>
                                SPELLS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}
