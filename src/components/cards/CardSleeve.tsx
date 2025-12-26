'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from '@/store/profile-store';
import clsx from 'clsx';

export const CardSleeve: React.FC = () => {
    const { activeSleeveId } = useProfileStore();

    const getSleeveStyles = () => {
        switch (activeSleeveId) {
            case 'void_ripple':
                return {
                    bg: 'bg-[#091428]',
                    pattern: 'radial-gradient(circle at center, #581c87 0%, transparent 70%)',
                    animation: 'animate-pulse'
                };
            case 'solar_flare':
                return {
                    bg: 'bg-[#1e0a0a]',
                    pattern: 'linear-gradient(45deg, #7f1d1d 0%, #b45309 100%)',
                    animation: 'animate-pulse'
                };
            default:
                return {
                    bg: 'bg-[#091428]',
                    pattern: 'none',
                    animation: 'none'
                };
        }
    };

    const styles = getSleeveStyles();

    return (
        <div className={clsx("w-full h-full rounded-[2rem] border-4 border-[#c8aa6e] p-4 relative overflow-hidden", styles.bg)}>
            {/* ANIMATED BACKGROUND */}
            <motion.div
                className={clsx("absolute inset-0 opacity-40", styles.animation)}
                style={{ background: styles.pattern }}
            />

            {/* NEXUS LOGO */}
            <div className="relative z-10 w-full h-full flex items-center justify-center border-2 border-[#c8aa6e]/20 rounded-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[#c8aa6e] mx-auto mb-2 flex items-center justify-center bg-black/40">
                        <div className="w-8 h-8 bg-[#c8aa6e] rounded-sm transform rotate-45" />
                    </div>
                    <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.4em]">RIFTBOUND</div>
                </div>
            </div>

            {/* CORNER ACCENTS */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#c8aa6e]/40" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#c8aa6e]/40" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#c8aa6e]/40" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#c8aa6e]/40" />
        </div>
    );
};
