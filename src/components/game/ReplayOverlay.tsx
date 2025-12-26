import React from 'react';
import { useGameStore } from '@/store/game-store';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Share2, X } from 'lucide-react';
import { ReplayService } from '@/services/replay-service';

export const ReplayOverlay: React.FC = () => {
    const {
        isReplayMode,
        replayData,
        currentReplayIndex,
        stepReplay,
        seekReplay,
        loadReplay
    } = useGameStore();

    if (!isReplayMode || !replayData) return null;

    const totalActions = replayData.actions.length;
    const progress = ((currentReplayIndex + 1) / totalActions) * 100;

    const handleShare = () => {
        const url = ReplayService.getShareUrl(replayData);
        navigator.clipboard.writeText(url);
        alert('Replay URL copied to clipboard!');
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Replay Mode</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                        Action {currentReplayIndex + 1} / {totalActions}
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative h-2 bg-slate-800 rounded-full mb-6 group cursor-pointer">
                    <div
                        className="absolute h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                    <input
                        type="range"
                        min="-1"
                        max={totalActions - 1}
                        value={currentReplayIndex}
                        onChange={(e) => seekReplay(parseInt(e.target.value))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => seekReplay(-1)}
                            className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Reset"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={() => stepReplay(-1)}
                            className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <SkipBack size={24} />
                        </button>
                        <button
                            className="w-12 h-12 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 hover:bg-cyan-500/30 transition-all active:scale-95"
                        >
                            <Play size={24} fill="currentColor" />
                        </button>
                        <button
                            onClick={() => stepReplay(1)}
                            className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <SkipForward size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-200 transition-colors"
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
