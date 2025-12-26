import React from 'react';
import { AIService } from '@/services/ai-service';
import { useGameStore } from '@/store/game-store';

export const AIVisionOverlay: React.FC = () => {
    const { players, isReplayMode } = useGameStore();
    const confidence = AIService.lastConfidence;

    if (!confidence || confidence.length === 0) return null;

    // We only show vision if it's the AI's turn or we are in a replay analysis
    // For this prototype, we'll allow toggling it or just showing last AI move results.

    const renderProbability = (prob: number) => {
        if (prob < 0.01) return null;
        const percent = (prob * 100).toFixed(1);
        const opacity = Math.min(1, prob * 2); // Higher confidence = brighter

        return (
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                style={{ opacity }}
            >
                <div className="bg-cyan-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/50 backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse scale-110">
                    {percent}%
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {/* 1. Hand Probabilities (Indices 1-10) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                {players.player.hand.map((card, i) => (
                    <div key={card.instanceId} className="relative w-24 h-36">
                        {renderProbability(confidence[i + 1] || 0)}
                    </div>
                ))}
            </div>

            {/* 2. Board Probabilities (Indices 11-16) */}
            {/* Note: This is simplified, real mapping needs to match UI slots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 flex gap-4">
                {players.player.field.map((card, i) => (
                    <div key={card.instanceId} className="relative w-28 h-40">
                        {renderProbability(confidence[i + 11] || 0)}
                    </div>
                ))}
            </div>

            {/* 3. Global Stats */}
            <div className="absolute top-24 left-8 bg-black/40 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-2">Neural Evaluation</div>
                <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-300">Pass Prob:</span>
                    <span className="text-white font-mono">{(confidence[0] * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs mt-1">
                    <span className="text-slate-300">End Turn Prob:</span>
                    <span className="text-white font-mono">{(confidence[21] * 100).toFixed(2)}%</span>
                </div>
            </div>
        </div>
    );
};
