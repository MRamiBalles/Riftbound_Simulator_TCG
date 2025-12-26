'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface HoloCardProps {
    rarity: string;
    children: React.ReactNode;
}

export const HoloEffect: React.FC<HoloCardProps> = ({ rarity, children }) => {
    const isHighRarity = ['Legendary', 'Champion'].includes(rarity);

    if (!isHighRarity) return <>{children}</>;

    return (
        <div className="relative group overflow-hidden rounded-[2rem]">
            {/* BASE CARD */}
            {children}

            {/* HOLO OVERLAY */}
            <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `linear-gradient(135deg, 
                        rgba(255,255,255,0) 0%, 
                        rgba(255,255,255,0.2) 25%, 
                        rgba(100,200,255,0.3) 50%, 
                        rgba(255,100,255,0.2) 75%, 
                        rgba(255,255,255,0) 100%
                    )`,
                    backgroundSize: '200% 200%'
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '200% 200%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />

            {/* SHIMMER LINE */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40"
                style={{
                    background: 'linear-gradient(90deg, transparent, white, transparent)',
                    width: '20%',
                    left: '-20%',
                    skewX: '-25deg'
                }}
                animate={{ left: '120%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
            />
        </div>
    );
};
