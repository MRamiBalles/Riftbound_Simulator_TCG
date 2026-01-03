import React from 'react';
import { Camera, Eye, Zap, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { useGameStore } from '@/store/game-store';

/**
 * Streamer Toolkit Overlay (Phase 16)
 * High-contrast HUD for live streaming and content creation.
 */
export const StreamerOverlay: React.FC = () => {
    const { engine, aiMode, winRatePrediction } = useGameStore();

    // Mock win rate if not calculated
    const [mockPrediction, setMockPrediction] = React.useState<string | null>(null);

    React.useEffect(() => {
        setMockPrediction((Math.random() * 40 + 30).toFixed(1));
    }, []);

    const predictionValue = winRatePrediction || mockPrediction || "50.0";

    return (
        <div className="fixed top-24 left-8 z-40 w-64 pointer-events-none space-y-4 animate-in fade-in slide-in-from-left duration-700">
            {/* Live Stats Header */}
            <div className="bg-black/80 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-r-xl shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">LIVE FEED</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono">
                    <Eye size={12} /> 1.2K
                </div>
            </div>

            {/* Tactical Heatmap Info */}
            <div className="bg-[#091428]/90 backdrop-blur-lg border border-white/10 p-4 rounded-xl shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={14} className="text-[#0ac8b9]" />
                    <span className="text-[10px] font-bold text-[#f0e6d2] uppercase tracking-widest">Neural Prediction</span>
                </div>

                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-[#0ac8b9] transition-all duration-1000"
                        style={{ width: `${predictionValue}%` }}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[8px] text-[#5c5b57] font-black uppercase">Advantage</span>
                    <span className="text-xl font-black text-[#0ac8b9] font-mono">{predictionValue}%</span>
                </div>
            </div>

            {/* Streamer Branding Area */}
            <div className="bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/30 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#c8aa6e]/20 border border-[#c8aa6e]/40 flex items-center justify-center">
                        <Camera size={14} className="text-[#c8aa6e]" />
                    </div>
                    <div>
                        <div className="text-[8px] text-[#c8aa6e] font-black uppercase tracking-widest">Active Partner</div>
                        <div className="text-xs font-bold text-white">RIFT_GENESIS_01</div>
                    </div>
                </div>
                <div className="text-[7px] text-[#a09b8c] uppercase font-bold leading-tight">
                    Powered by Riftbound Neural Engine v5.0 // Infinite Horizon Ready
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/60 p-3 rounded-lg border border-white/5 flex flex-col items-center">
                    <TrendingUp size={12} className="text-amber-400 mb-1" />
                    <span className="text-[7px] text-[#5c5b57] font-black uppercase">Volatility</span>
                    <span className="text-[10px] font-bold text-amber-400">LOW</span>
                </div>
                <div className="bg-black/60 p-3 rounded-lg border border-white/5 flex flex-col items-center">
                    <BarChart2 size={12} className="text-blue-400 mb-1" />
                    <span className="text-[7px] text-[#5c5b57] font-black uppercase">Complexity</span>
                    <span className="text-[10px] font-bold text-blue-400">HIGH</span>
                </div>
            </div>
        </div>
    );
};
