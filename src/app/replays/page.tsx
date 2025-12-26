'use client';

import { useState, useEffect } from 'react';
import { ReplayService, ReplayData } from '@/services/replay-service';
import { ReplayViewer } from '@/components/Replay/ReplayViewer';
import { History, Share2, Play, Trash2, Trophy, Skull } from 'lucide-react';
import Link from 'next/link';

export default function ReplayLibraryPage() {
    const [replays, setReplays] = useState<ReplayData[]>([]);
    const [selectedReplay, setSelectedReplay] = useState<ReplayData | null>(null);

    useEffect(() => {
        setReplays(ReplayService.getLibrary());
    }, []);

    const deleteReplay = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = replays.filter(r => r.id !== id);
        setReplays(updated);
        localStorage.setItem('riftbound_replays', JSON.stringify(updated));
    };

    const copyShareLink = (replay: ReplayData, e: React.MouseEvent) => {
        e.stopPropagation();
        const code = ReplayService.exportReplay(replay);
        navigator.clipboard.writeText(code);
        alert('Replay code copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#010a13] text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
                            <History className="text-cyan-500" size={36} />
                            LIBRARY OF LEGENDS
                        </h1>
                        <p className="text-white/40 font-mono text-sm">ARCHIVED COMBAT SIMULATIONS & AI EVALUATIONS</p>
                    </div>
                    <Link
                        href="/game"
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-all"
                    >
                        BACK TO ARENA
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                    {/* List */}
                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                        {replays.length === 0 ? (
                            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                <History size={48} className="mx-auto text-white/10 mb-4" />
                                <div className="text-white/20 font-bold">NO REPLAYS ARCHIVED</div>
                            </div>
                        ) : (
                            replays.map((replay) => (
                                <div
                                    key={replay.id}
                                    onClick={() => setSelectedReplay(replay)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedReplay?.id === replay.id
                                            ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-900/10'
                                            : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {replay.winner === 'player' ? (
                                                <Trophy size={16} className="text-yellow-500" />
                                            ) : (
                                                <Skull size={16} className="text-red-500" />
                                            )}
                                            <span className={`text-xs font-black uppercase tracking-widest ${replay.winner === 'player' ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                {replay.winner === 'player' ? 'Victory' : 'Defeat'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-white/20 font-mono">{new Date(replay.date).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="font-bold text-white/80 group-hover:text-white transition-colors">Simulation {replay.id.slice(0, 8)}</h3>

                                    <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => copyShareLink(replay, e)}
                                            className="p-1.5 hover:bg-cyan-500/20 rounded-md text-cyan-400 transition-colors"
                                            title="Copy Share Code"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => deleteReplay(replay.id, e)}
                                            className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors ml-auto"
                                            title="Delete Replay"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Viewer Area */}
                    <div className="min-h-[600px]">
                        {selectedReplay ? (
                            <div className="h-full animate-in fade-in slide-in-from-right-4 duration-500">
                                <ReplayViewer replay={selectedReplay} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01]">
                                <Play size={64} className="text-white/5 mb-6" />
                                <h2 className="text-xl font-black text-white/20 italic tracking-tighter uppercase">Select a memory to manifest</h2>
                                <p className="text-white/10 font-mono text-sm mt-2">DETERMINISTIC PLAYBACK ENGINE READY</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
}
