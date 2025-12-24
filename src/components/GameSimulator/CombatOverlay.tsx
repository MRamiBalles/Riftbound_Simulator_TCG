'use client';

import { useGameStore } from '@/store/game-store';
import { Swords, Sword, Shield, CheckCircle } from 'lucide-react';
import React from 'react';

export function CombatOverlay() {
    const { combat, activePlayer, priority, performAction } = useGameStore();

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
        </div>
    );
}

/* Add simplified clip path utility if needed or use standard CSS */
