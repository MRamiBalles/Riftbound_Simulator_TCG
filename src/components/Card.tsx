'use client';

import { Card as CardType } from '@/lib/database.types';
import clsx from 'clsx';
import { Shield, Sword, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { CardTooltip } from './CardTooltip';

interface CardProps {
    card: CardType;
    onClick?: () => void;
}

export function Card({ card, onClick }: CardProps) {
    const isChampion = card.rarity === 'Champion';

    return (
        <div
            onClick={onClick}
            className={clsx(
                "group relative w-64 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(200,170,110,0.4)]",
                "card-frame", // New Hextech Card Frame class
                isChampion && "border-[#c8aa6e] shadow-[0_0_20px_rgba(200,170,110,0.2)]"
            )}
        >
            <CardTooltip keywords={(card as any).keywords || []} />
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <div className="relative w-full h-full">
                    {/* Fallback image if remote fails, but for now we use the real URL */}
                    <img
                        src={card.image_url}
                        alt={card.name}
                        className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    />

                    {/* VIRTUAL WATERMARK */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        <div className="text-[40px] font-black text-white/10 -rotate-45 whitespace-nowrap select-none border-4 border-white/10 px-8 py-2 uppercase tracking-widest backdrop-blur-[1px]">
                            VIRTUAL
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-transparent opacity-90" />
                </div>
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">

                {/* Top Header */}
                <div className="flex justify-between items-start">
                    <div className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-lg ring-1 ring-[#c8aa6e]",
                        "bg-[#091428] text-[#f0e6d2] font-serif"
                    )}>
                        {card.cost}
                    </div>

                    {isChampion && (
                        <div className="p-1 rounded bg-[#c8aa6e]/20 backdrop-blur-md border border-[#c8aa6e]">
                            <Sparkles className="w-4 h-4 text-[#f0e6d2]" />
                        </div>
                    )}
                </div>

                {/* Bottom Info */}
                <div className="space-y-2">
                    <div className="text-center">
                        <h3 className={clsx(
                            "text-xl font-bold tracking-wide text-[#f0e6d2] drop-shadow-md uppercase",
                            isChampion ? "text-[#c8aa6e]" : "text-[#f0e6d2]"
                        )} style={{ fontFamily: 'Beaufort, sans-serif' }}>
                            {card.name}
                        </h3>
                        <p className="text-xs text-[#a09b8c] uppercase tracking-wider font-semibold">{card.region}</p>
                    </div>

                    {/* Stats for Units */}
                    {(card.attack !== undefined || card.health !== undefined) && (
                        <div className="flex justify-between px-2 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1 text-red-400 font-bold text-lg bg-black/40 rounded px-2 py-0.5 backdrop-blur-sm">
                                <Sword className="w-4 h-4" /> {card.attack}
                            </div>
                            <div className="flex items-center gap-1 text-blue-400 font-bold text-lg bg-black/40 rounded px-2 py-0.5 backdrop-blur-sm">
                                <Shield className="w-4 h-4" /> {card.health}
                            </div>
                        </div>
                    )}

                    {/* Market Price */}
                    <div className="mt-2 flex justify-between items-center text-xs text-slate-400 bg-slate-950/60 p-2 rounded-md backdrop-blur-sm">
                        <span>Market Price</span>
                        <div className="flex flex-col items-end">
                            <span className="text-green-400 font-mono font-bold">${(card.market_price || 0).toFixed(2)}</span>
                            <span className={clsx(
                                "text-[10px]",
                                (card.price_change_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                                {(card.price_change_24h || 0) > 0 ? '+' : ''}{(card.price_change_24h || 0).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
