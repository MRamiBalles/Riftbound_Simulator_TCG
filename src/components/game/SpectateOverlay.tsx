import React from 'react';
import { useGameStore } from '@/store/game-store';
import { Eye, Users, Activity } from 'lucide-react';

export const SpectateOverlay: React.FC = () => {
    const { isMultiplayerMode, winner, turn } = useGameStore();

    if (!isMultiplayerMode || winner) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="flex items-center gap-6 px-6 py-3 bg-[#010a13]/80 backdrop-blur-xl border border-cyan-500/30 rounded-full shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                <div className="flex items-center gap-2 text-cyan-400">
                    <div className="relative">
                        <Activity size={18} className="animate-pulse" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-md animate-ping rounded-full" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Live Arena Duel</span>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2 text-slate-400">
                    <Eye size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Global Spectators: 42</span>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="text-[10px] font-mono text-[#c8aa6e]">
                    TURN {turn} • ROUND PHASE
                </div>
            </div>
        </div>
    );
};
