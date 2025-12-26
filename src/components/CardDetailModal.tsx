'use client';

import React, { useRef, useState } from 'react';
import { Card } from '@/lib/database.types';
import { X, ExternalLink, Heart, Share2, Info } from 'lucide-react';
import clsx from 'clsx';
import { Card as CardComponent } from './Card';

interface CardDetailModalProps {
    card: Card;
    onClose: () => void;
    virtualCount?: number;
    realCount?: number;
}

export default function CardDetailModal({ card, onClose, virtualCount = 0, realCount = 0 }: CardDetailModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -20; // Max 20deg tilt
        const rotateY = ((x - centerX) / centerX) * 20;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#a09b8c] hover:text-[#f0e6d2] transition-colors p-2"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 max-w-6xl w-full">
                {/* 3D INTERACTIVE CARD */}
                <div
                    className="perspective-1000 w-full max-w-sm flex justify-center"
                >
                    <div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.1, 1.1, 1.1)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                        className="relative w-[300px] h-[450px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing hover:shadow-[0_0_50px_rgba(10,200,185,0.3)] rounded-xl"
                    >
                        <CardComponent card={card} />

                        {/* Shine Effect */}
                        <div
                            className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay"
                            style={{
                                opacity: Math.abs(rotation.x) + Math.abs(rotation.y) > 5 ? 1 : 0,
                                transform: `translateX(${-rotation.y * 2}px) translateY(${-rotation.x * 2}px)`
                            }}
                        />
                    </div>
                </div>

                {/* INFO PANEL */}
                <div className="flex-1 text-[#f0e6d2] max-w-lg space-y-6">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#c8aa6e]" style={{ fontFamily: 'Beaufort' }}>
                            {card.name.toUpperCase()}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-[#a09b8c] uppercase tracking-widest text-sm">
                            <span>{card.region}</span>
                            <span>&bull;</span>
                            <span>{card.type}</span>
                            <span>&bull;</span>
                            <span className={clsx(
                                card.rarity === 'Champion' ? 'text-[#c8aa6e]' :
                                    card.rarity === 'Epic' ? 'text-[#a020f0]' :
                                        card.rarity === 'Rare' ? 'text-[#0ac8b9]' : 'text-gray-400'
                            )}>{card.rarity}</span>
                        </div>
                    </div>

                    <div className="bg-[#091428]/50 border-l-2 border-[#c8aa6e] p-4 italic text-[#a09b8c]">
                        "{card.flavor_text}"
                    </div>

                    <div className="bg-[#1e2328] rounded-xl p-6 border border-[#7a5c29]/30 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#7a5c29]/30 pb-4">
                            <span className="text-[#a09b8c]">Wait, I own...</span>
                            <div className="flex gap-4">
                                <span className="text-[#0ac8b9] font-bold">{virtualCount} Virtual</span>
                                <span className="text-[#c8aa6e] font-bold">{realCount} Real</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-[#a09b8c]">Market Price</span>
                            <span className="text-xl font-bold text-[#0ac8b9]">${card.market_price?.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-[#a09b8c]">Artist</span>
                            <span className="text-[#f0e6d2]">{card.artist}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 btn-hextech flex items-center justify-center gap-2">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <button className="flex-1 btn-hextech flex items-center justify-center gap-2 border-[#0ac8b9] text-[#0ac8b9]">
                            <ExternalLink className="w-4 h-4" /> TCGPlayer
                        </button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-[#a09b8c] uppercase tracking-widest mb-3">Feature in Showcase</h4>
                        <div className="grid grid-cols-9 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => useCollectionStore.getState().setShowcaseSlot(i, card.id)}
                                    className={clsx(
                                        "aspect-square rounded border text-[10px] font-bold flex items-center justify-center transition-all",
                                        useCollectionStore.getState().showcase[i] === card.id
                                            ? "bg-[#0ac8b9] text-[#010a13] border-[#0ac8b9]"
                                            : "border-white/10 text-white/40 hover:border-[#c8aa6e]/50 hover:text-[#c8aa6e]"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
