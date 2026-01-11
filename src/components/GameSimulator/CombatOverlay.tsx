"use client";

import { useGameStore } from '@/store/game-store';
import { Swords, Sword, Shield, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface DamageFloater {
    id: number;
    value: number;
    x: number;
    y: number;
    isPlayer: boolean;
}

export function CombatOverlay() {
    const { combat, activePlayer, priority, performAction } = useGameStore();
    const [floaters, setFloaters] = useState<DamageFloater[]>([]);

    useEffect(() => {
        const handleDamage = (e: CustomEvent) => {
            const { amount, targetId, isPlayer } = e.detail;
            // Randomize position slightly
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * 100;

            const newFloater: DamageFloater = {
                id: Date.now(),
                value: amount,
                x,
                y,
                isPlayer
            };

            setFloaters(prev => [...prev, newFloater]);
            setTimeout(() => {
                setFloaters(prev => prev.filter(f => f.id !== newFloater.id));
            }, 1000);
        };

        window.addEventListener('RIFTBOUND_DAMAGE' as any, handleDamage as any);
        return () => window.removeEventListener('RIFTBOUND_DAMAGE' as any, handleDamage as any);
    }, []);

    if (!combat || !combat.isCombatPhase) return null;

    const isMyPriority = priority === 'player';
    const isAttacker = activePlayer === 'player';
    const step = combat.step;

    if (!isMyPriority) {
        return (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-black/80 text-white px-6 py-3 rounded-full border border-[#c8aa6e] backdrop-blur-md animate-pulse flex items-center gap-3">
                    <Swords className="w-5 h-5 text-[#c8aa6e]" />
                    <span className="font-serif tracking-widest">OPPONENT DECIDING...</span>
                </div>
            </div>
        );
    }

    const handleConfirm = () => {
        if (step === 'declare_attackers') {
            performAction({ type: 'DECLARE_ATTACKERS', playerId: 'player', attackers: Object.keys(combat.attackers) });
        } else if (step === 'declare_blockers') {
            performAction({ type: 'DECLARE_BLOCKERS', playerId: 'player', blockers: combat.blockers });
        }
    };

    return (
        <div className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center">
            {/* Context Header */}
            <div className="absolute top-24 bg-black/60 backdrop-blur text-[#f0e6d2] px-8 py-4 rounded-xl border border-[#c8aa6e]/50 pointer-events-auto shadow-[0_0_30px_rgba(200,170,110,0.2)]">
                <h2 className="text-2xl font-bold flex items-center gap-3 font-serif">
                    {step === 'declare_attackers' && (
                        <> <Sword className="w-6 h-6 text-red-500" /> DECLARE ATTACK </>
                    )}
                    {step === 'declare_blockers' && (
                        <> <Shield className="w-6 h-6 text-blue-500" /> DECLARE BLOCKERS </>
                    )}
                </h2>
                <p className="text-center text-[#c8aa6e] text-sm mt-1 uppercase tracking-widest opacity-80">
                    {step === 'declare_attackers'
                        ? "Select units to attack"
                        : "Drag units to block"
                    }
                </p>
            </div>

            {/* Action Button */}
            <div className="absolute bottom-32 pointer-events-auto">
                <button
                    onClick={handleConfirm}
                    className="group relative px-8 py-3 bg-[#c8aa6e] hover:bg-[#ffeebb] text-[#010a13] font-bold tracking-widest uppercase rounded-sm clip-path-hextech transition-all shadow-[0_0_20px_rgba(200,170,110,0.4)] hover:shadow-[0_0_30px_rgba(200,170,110,0.6)]"
                >
                    <div className="flex items-center gap-2">
                        <Swords className="w-5 h-5" />
                        <span>CONFIRM {step === 'declare_attackers' ? 'ATTACK' : 'BLOCKS'}</span>
                    </div>
                </button>
            </div>

            {/* Damage Floaters */}
            <AnimatePresence>
                {floaters.map(f => (
                    <motion.div
                        key={f.id}
                        initial={{ opacity: 0, scale: 0.5, y: f.y, x: f.x }}
                        animate={{ opacity: 1, scale: 1.5, y: f.y - 100 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className={`fixed z-50 font-black text-6xl drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none ${f.isPlayer ? 'text-red-500' : 'text-blue-500'}`}
                        style={{ textShadow: '0 0 4px black' }}
                    >
                        -{f.value}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* Add simplified clip path utility if needed or use standard CSS */
