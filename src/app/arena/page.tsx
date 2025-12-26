'use client';

import React, { useState, useEffect } from 'react';
import { Swords, Users, Shield, Zap, Globe, Lock, Search } from 'lucide-react';
import { MultiplayerService, LobbyState } from '@/services/multiplayer-service';
import { useLeaderboardStore, Tier } from '@/store/leaderboard-store';
import EnergyWidget from '@/components/layout/EnergyWidget';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, TrendingUp, Medal, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function RiftArenaPage() {
    const router = useRouter();
    const [status, setStatus] = useState<LobbyState>('IDLE');
    const [roomCode, setRoomCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const { topPlayers, userRank } = useLeaderboardStore();

    const getTierColor = (tier: Tier) => {
        switch (tier) {
            case 'CHALLENGER': return 'text-amber-400';
            case 'MASTER': return 'text-purple-400';
            case 'DIAMOND': return 'text-cyan-400';
            case 'GOLD': return 'text-yellow-500';
            case 'SILVER': return 'text-slate-300';
            default: return 'text-orange-900';
        }
    };

    const startMatchmaking = () => {
        setIsSearching(true);
        setStatus('SEARCHING');
        // Simulate finding a match
        setTimeout(() => {
            router.push('/play?mode=pvp&room=global-1');
        }, 3000);
    };

    const joinPrivate = () => {
        if (!roomCode) return;
        router.push(`/play?mode=pvp&room=${roomCode}`);
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif overflow-hidden relative pt-24 pb-12">
            <EnergyWidget />

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt3fc05c6dce80b2d6/62e0339ab3b2111162629633/01PZ008-full.png')] bg-cover bg-center opacity-10 grayscale mix-blend-screen" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_80%)]" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col items-center">
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] uppercase" style={{ fontFamily: 'Beaufort' }}>
                        Rift Arena
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-4 text-[#a09b8c] text-[10px] md:text-xs tracking-[0.3em] uppercase">
                        <span className="flex items-center gap-1.5"><Globe size={14} className="text-[#0ac8b9]" /> Global Servers: LIVE</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0ac8b9] animate-pulse" />
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-[#c8aa6e]" /> 1,240 Online</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Matchmaking Card */}
                    <div className="group relative p-8 bg-[#091428]/80 backdrop-blur-xl border border-[#c8aa6e]/20 rounded-3xl overflow-hidden hover:border-[#c8aa6e]/60 transition-all shadow-2xl flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <Swords size={120} />
                        </div>

                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7a5c29] to-[#c8aa6e] p-0.5 mb-6 shadow-[0_0_30px_rgba(200,170,110,0.3)]">
                            <div className="w-full h-full rounded-full bg-[#010a13] flex items-center justify-center text-[#c8aa6e]">
                                <Shield className="w-10 h-10" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Beaufort' }}>RANKED LADDER</h2>
                        <p className="text-sm text-[#a09b8c] mb-8 leading-relaxed">
                            Face off against players of similar skill level and climb the global ranks of the Riftbound.
                        </p>

                        <button
                            onClick={startMatchmaking}
                            disabled={isSearching}
                            className={`w-full py-4 rounded-xl text-sm font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 overflow-hidden relative ${isSearching
                                ? 'bg-slate-800 text-slate-500 border border-white/5'
                                : 'bg-[#c8aa6e] text-[#010a13] hover:shadow-[0_0_40px_rgba(200,170,110,0.4)] active:scale-95 border border-white/20'
                                }`}
                        >
                            {isSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                                    Finding Opponent...
                                </>
                            ) : (
                                <>
                                    <Zap size={18} /> Seek Combat
                                </>
                            )}
                            {isSearching && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            )}
                        </button>
                    </div>

                    {/* Private Match Card */}
                    <div className="group relative p-8 bg-[#091428]/80 backdrop-blur-xl border border-[#0ac8b9]/20 rounded-3xl overflow-hidden hover:border-[#0ac8b9]/60 transition-all shadow-2xl flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <Lock size={120} />
                        </div>

                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#005a82] to-[#0ac8b9] p-0.5 mb-6 shadow-[0_0_30px_rgba(10,200,185,0.3)]">
                            <div className="w-full h-full rounded-full bg-[#010a13] flex items-center justify-center text-[#0ac8b9]">
                                <Lock className="w-10 h-10" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Beaufort' }}>PRIVATE ROOM</h2>
                        <p className="text-sm text-[#a09b8c] mb-6 leading-relaxed">
                            Infiltrate a specific arena with a secret code to duel with friends or specific lab partners.
                        </p>

                        <div className="w-full space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a09b8c]" />
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={e => setRoomCode(e.target.value)}
                                    placeholder="ENTER ROOM CODE..."
                                    className="w-full bg-black/60 border border-[#0ac8b9]/20 rounded-xl py-4 pl-12 pr-4 text-xs font-mono tracking-widest text-[#0ac8b9] focus:outline-none focus:border-[#0ac8b9] transition-all placeholder:text-[#0ac8b9]/30 uppercase"
                                />
                            </div>
                            <button
                                onClick={joinPrivate}
                                className="w-full py-4 rounded-xl bg-[#0ac8b9]/10 border border-[#0ac8b9]/40 text-[#0ac8b9] hover:bg-[#0ac8b9] hover:text-[#010a13] text-sm font-black tracking-widest uppercase transition-all active:scale-95 shadow-[inset_0_0_20px_rgba(10,200,185,0.1)]"
                            >
                                Enter Arena
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- PRO LEADERBOARD SECTION --- */}
                <section className="w-full max-w-4xl mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <Trophy className="text-[#c8aa6e] w-8 h-8" />
                        <div>
                            <h2 className="text-3xl font-black tracking-widest text-[#f0e6d2] uppercase">Global Pro-Ladder</h2>
                            <p className="text-[#a09b8c] text-[10px] uppercase tracking-[0.3em]">Elite Competitive Circuit</p>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#c8aa6e]/30 to-transparent ml-4" />
                        <Link href="/bazaar" className="btn-hextech px-6 py-2 text-[10px] flex items-center gap-2">
                            THE BAZAAR <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Rankings List */}
                        <div className="lg:col-span-2 space-y-2">
                            {topPlayers.map((p) => (
                                <div key={p.rank} className="flex items-center justify-between p-4 bg-[#091428]/40 border border-white/5 rounded-2xl hover:bg-[#091428]/60 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg",
                                            p.rank === 1 ? "bg-amber-400/20 text-amber-400" : "bg-white/5 text-[#a09b8c]"
                                        )}>
                                            {p.rank}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#f0e6d2] group-hover:text-white transition-colors">{p.username}</div>
                                            <div className={clsx("text-[10px] font-black uppercase tracking-widest", getTierColor(p.tier))}>
                                                {p.tier}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-[#0ac8b9] font-mono">{p.mmr} MMR</div>
                                        <div className="text-[10px] text-[#5c5b57] font-bold">WR: {p.winRate}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* User Status Card */}
                        {userRank && (
                            <div className="bg-gradient-to-b from-[#091428] to-black border border-[#c8aa6e]/30 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden h-fit">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#c8aa6e] opacity-50" />
                                <Medal className="w-16 h-16 text-[#c8aa6e] mb-6 drop-shadow-[0_0_20px_rgba(200,170,110,0.4)]" />

                                <h3 className="text-xl font-black uppercase tracking-widest mb-1">{userRank.username}</h3>
                                <p className={clsx("text-xs font-black uppercase tracking-[0.3em] mb-8", getTierColor(userRank.tier))}>
                                    {userRank.tier} DIVISION
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-[#a09b8c] uppercase font-bold mb-1">MMR</div>
                                        <div className="text-xl font-black text-[#0ac8b9] font-mono">{userRank.mmr}</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-[#a09b8c] uppercase font-bold mb-1">Rank</div>
                                        <div className="text-xl font-black text-[#f0e6d2] font-mono">#{userRank.rank}</div>
                                    </div>
                                </div>

                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#5c5b57]">
                                        <span>Progress to Gold</span>
                                        <span>{Math.round((userRank.mmr / 1500) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#c8aa6e] to-amber-200 transition-all duration-1000"
                                            style={{ width: `${(userRank.mmr / 1500) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <div className="mt-16 text-center">
                    <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                        RETURN TO LABORATORY HUB
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </main>
    );
}
