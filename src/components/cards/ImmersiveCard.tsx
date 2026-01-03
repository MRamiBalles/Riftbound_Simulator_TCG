'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/lib/database.types';
import { LegacyService } from '@/services/legacy-service';
import { useUserStore } from '@/store/user-store';
import { useCosmeticStore } from '@/store/cosmetic-store';
import { motion, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { Trophy, Swords, Zap } from 'lucide-react';
import clsx from 'clsx';

interface ImmersiveCardProps {
    card: Card;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    showStats?: boolean;
}

/**
 * ImmersiveCard (Phase 23)
 * Provides 3D parallax visual effects matching TCGP's Immersive Cards.
 */
export function ImmersiveCard({ card, size = 'md', className, onClick, showStats = true }: ImmersiveCardProps) {
    const [isMounted, setIsMounted] = useState(false);
    const { cardLegacies } = useUserStore();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only access store legacy data after mount to avoid hydration mismatch
    const legacy = isMounted ? (cardLegacies[card.id] || { wins: 0, games: 0, kills: 0 }) : { wins: 0, games: 0, kills: 0 };
    const title = LegacyService.getTitle(legacy);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    const handleMouseMove = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - rect.width / 2;
        const mouseY = event.clientY - rect.top - rect.height / 2;
        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const { equippedSkins } = useCosmeticStore();
    const skin = equippedSkins[card.id] || 'DEFAULT';

    return (
        <motion.div
            style={{ rotateX, rotateY, perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={clsx(
                "relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border-2 transition-all duration-500",
                skin === 'GOLD_BORDER' ? "border-[#c8aa6e] shadow-[0_0_30px_rgba(200,170,110,0.3)]" : "border-transparent",
                className
            )}
        >
            {/* Prism Overlay (Phase 40) */}
            {skin === 'PRISM' && (
                <motion.div
                    className="absolute inset-0 z-40 mix-blend-color-dodge opacity-30 pointer-events-none"
                    style={{
                        background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
                        filter: 'hue-rotate(0deg)',
                    }}
                    animate={{ filter: 'hue-rotate(360deg)' }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
            )}

            {/* Void Static (Phase 40) */}
            {skin === 'VOID_STATIC' && (
                <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(139,92,246,0.1)_100%)] pointer-events-none animate-pulse" />
            )}

            {/* Background Layer (Parallax 1) */}
            <div className="absolute inset-0 bg-black">
                <img
                    src={card.image_url}
                    alt=""
                    className="w-full h-full object-cover opacity-20 scale-110"
                />
            </div>

            {/* Depth Overlay (Parallax 2) */}
            <motion.div
                style={{
                    x: useTransform(x, [-100, 100], [-10, 10]),
                    y: useTransform(y, [-100, 100], [-10, 10])
                }}
                className="absolute inset-0 z-10 pointer-events-none"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </motion.div>

            {/* Main Card Art (Parallax 3) */}
            <motion.div
                style={{
                    x: useTransform(x, [-100, 100], [-2, 2]),
                    y: useTransform(y, [-100, 100], [-2, 2])
                }}
                className="absolute inset-4 z-20 border border-white/10 rounded-xl overflow-hidden shadow-inner"
            >
                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
            </motion.div>

            {/* Foil Glint */}
            <motion.div
                style={{
                    background: useTransform(
                        [x, y],
                        (values: number[]) => {
                            const [valX, valY] = values;
                            return `radial-gradient(circle at ${50 + valX / 2}% ${50 + valY / 2}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
                        }
                    )
                }}
                className="absolute inset-0 z-30 pointer-events-none"
            />

            {/* UI Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-40">
                {title && (
                    <div className="text-[8px] font-black text-[#0ac8b9] uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                        <Trophy size={10} /> {title}
                    </div>
                )}
                <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em] mb-1">{card.rarity}</div>
                <div className="text-xl font-black text-white uppercase tracking-tight mb-2">{card.name}</div>

                <div className="flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="text-[8px] text-[#a09b8c] font-black uppercase tracking-widest flex items-center gap-1">
                        <Swords size={10} /> {legacy.kills}K
                    </div>
                    <div className="text-[8px] text-[#a09b8c] font-black uppercase tracking-widest flex items-center gap-1">
                        <Zap size={10} /> {legacy.wins}W
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
