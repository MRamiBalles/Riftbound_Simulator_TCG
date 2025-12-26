'use client';

import React, { useState, useEffect } from 'react';
import { TournamentService, TournamentMatch } from '@/services/tournament-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Sword, Zap, Shield, Crown, Timer, Info, ChevronRight, Medal } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function TournamentPage() {
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [step, setStep] = useState<'REGISTER' | 'BRACKET' | 'FINALE'>('REGISTER');
    const [simulating, setSimulating] = useState(false);

    const startTournament = () => {
        setMatches(TournamentService.generateBracket());
        setStep('BRACKET');
    };

    const runSimulation = async () => {
        setSimulating(true);
        // Simulate Round of 16
        await new Promise(r => setTimeout(r, 1000));
        setMatches(prev => TournamentService.simulateRound(prev, 3));

        // Simulate Round of 8
        await new Promise(r => setTimeout(r, 1000));
        setMatches(prev => TournamentService.simulateRound(prev, 2));

        // Simulate Semis
        await new Promise(r => setTimeout(r, 1000));
        setMatches(prev => TournamentService.simulateRound(prev, 1));

        // Simulate Finals
        await new Promise(r => setTimeout(r, 1000));
        setMatches(prev => TournamentService.simulateRound(prev, 0));

        setSimulating(false);
        setStep('FINALE');
    };

    const finalWinner = matches.find(m => m.level === 0)?.winner;

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex justify-between items-end">
                    <div>
                        <h1 className="text-8xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'Beaufort' }}>
                            ZENITH WORLD CUP
                        </h1>
                        <p className="text-[#c8aa6e] text-xs font-black uppercase tracking-[0.5em] mt-4 flex items-center gap-2">
                            <Medal size={16} /> THE ULTIMATE DIMENSIONAL SHOWDOWN
                        </p>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {step === 'REGISTER' && (
                        <motion.div key="reg" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center mt-20">
                            <div className="bg-black/60 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-3xl max-w-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#c8aa6e]/5 to-transparent pointer-events-none" />
                                <Trophy size={64} className="text-[#c8aa6e] mx-auto mb-8 group-hover:scale-110 transition-transform" />
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">TOURNAMENT REGISTRATION</h2>
                                <p className="text-sm text-[#a09b8c] uppercase tracking-widest mb-12">16 Players. Single Elimination. Glory await.</p>

                                <div className="grid grid-cols-2 gap-4 mb-12 text-left">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="text-[10px] font-black text-[#c8aa6e] uppercase mb-1">ENTRY FEE</div>
                                        <div className="text-lg font-black text-white">1,000 SHARDS</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="text-[10px] font-black text-[#0ac8b9] uppercase mb-1">GRAND PRIZE</div>
                                        <div className="text-lg font-black text-white">CHAMPION SLEEVE</div>
                                    </div>
                                </div>

                                <button onClick={startTournament} className="w-full btn-hextech-primary py-6 text-md font-black uppercase tracking-[0.2em] relative overflow-hidden group">
                                    <span className="relative z-10 text-black">ENTER THE ARENA</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'BRACKET' && (
                        <motion.div key="bracket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex justify-between items-center mb-12 bg-black/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                                <div className="flex gap-8">
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-[#5c5b57] uppercase">STATUS</div>
                                        <div className="text-xs font-black text-white uppercase">{simulating ? 'SIMULATING MATCHES...' : 'BRACKET LOCKED'}</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-[#5c5b57] uppercase">PRIZE POOL</div>
                                        <div className="text-xs font-black text-[#c8aa6e] uppercase">50,000 STAR DUST</div>
                                    </div>
                                </div>
                                {!simulating && (
                                    <button onClick={runSimulation} className="btn-hextech px-12 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        START SIMULATION <Zap size={14} className="text-[#c8aa6e]" />
                                    </button>
                                )}
                            </div>

                            <div className="relative flex justify-between h-[800px] overflow-x-auto pb-4 scrollbar-hide">
                                {/* ROUND OF 16 */}
                                <div className="flex flex-col justify-around gap-4 min-w-[200px]">
                                    <div className="text-[10px] font-black text-[#5c5b57] uppercase text-center mb-4">ROUND OF 16</div>
                                    {matches.filter(m => m.level === 3).map(m => (
                                        <div key={m.id} className={clsx("p-4 rounded-xl border-2 transition-all", m.winner ? "bg-black/80 border-white/10" : "bg-black/40 border-white/5 hover:border-white/20")}>
                                            <div className={clsx("text-xs font-bold p-2 rounded", m.winner === m.player1 ? "text-[#0ac8b9]" : m.winner ? "opacity-30" : "text-white")}>{m.player1}</div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className={clsx("text-xs font-bold p-2 rounded", m.winner === m.player2 ? "text-[#0ac8b9]" : m.winner ? "opacity-30" : "text-white")}>{m.player2}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* QUARTERS */}
                                <div className="flex flex-col justify-around gap-4 min-w-[200px]">
                                    <div className="text-[10px] font-black text-[#5c5b57] uppercase text-center mb-4">QUARTER-FINALS</div>
                                    {matches.filter(m => m.level === 2).map(m => (
                                        <div key={m.id} className={clsx("p-4 rounded-xl border-2 transition-all", m.winner ? "bg-black/80 border-[#c8aa6e]/30 shadow-[0_0_20px_rgba(200,170,110,0.1)]" : "bg-black/40 border-white/5")}>
                                            <div className={clsx("text-xs font-bold p-2 rounded", m.winner === m.player1 ? "text-[#0ac8b9]" : m.winner ? "opacity-30" : "text-white")}>{m.player1}</div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className={clsx("text-xs font-bold p-2 rounded", m.winner === m.player2 ? "text-[#0ac8b9]" : m.winner ? "opacity-30" : "text-white")}>{m.player2}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* SEMIS */}
                                <div className="flex flex-col justify-around gap-4 min-w-[200px]">
                                    <div className="text-[10px] font-black text-[#5c5b57] uppercase text-center mb-4">SEMI-FINALS</div>
                                    {matches.filter(m => m.level === 1).map(m => (
                                        <div key={m.id} className={clsx("p-6 rounded-2xl border-2 transition-all", m.winner ? "bg-black/80 border-[#c8aa6e]/50 shadow-[0_0_40px_rgba(200,170,110,0.2)] scale-105" : "bg-black/40 border-white/10")}>
                                            <div className={clsx("text-sm font-black p-2 rounded", m.winner === m.player1 ? "text-[#c8aa6e]" : m.winner ? "opacity-30" : "text-white")}>{m.player1}</div>
                                            <div className="h-px bg-[#c8aa6e]/20 my-4" />
                                            <div className={clsx("text-sm font-black p-2 rounded", m.winner === m.player2 ? "text-[#c8aa6e]" : m.winner ? "opacity-30" : "text-white")}>{m.player2}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* FINALS */}
                                <div className="flex flex-col justify-center gap-4 min-w-[300px]">
                                    <div className="text-[10px] font-black text-[#c8aa6e] uppercase text-center mb-4 tracking-[0.4em]">GRAND FINALE</div>
                                    {matches.filter(m => m.level === 0).map(m => (
                                        <div key={m.id} className={clsx("p-12 rounded-[3rem] border-4 transition-all relative overflow-hidden", m.winner ? "bg-gradient-to-br from-black to-[#c8aa6e]/20 border-[#c8aa6e] shadow-[0_0_100px_rgba(200,170,110,0.3)]" : "bg-black/40 border-white/20 backdrop-blur-3xl")}>
                                            {m.winner && <Crown size={48} className="absolute -top-6 -right-6 text-[#c8aa6e] rotate-12 opacity-50" />}
                                            <div className={clsx("text-2xl font-black p-4 text-center text-white uppercase tracking-tighter", m.winner && m.winner !== m.player1 ? "opacity-20" : "")}>{m.player1}</div>
                                            <div className="flex items-center gap-4 my-8">
                                                <div className="h-px flex-1 bg-white/10" />
                                                <div className="text-[10px] font-black text-[#5c5b57]">VS</div>
                                                <div className="h-px flex-1 bg-white/10" />
                                            </div>
                                            <div className={clsx("text-2xl font-black p-4 text-center text-white uppercase tracking-tighter", m.winner && m.winner !== m.player2 ? "opacity-20" : "")}>{m.player2}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'FINALE' && (
                        <motion.div key="finale" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-12 text-center mt-12">
                            <div className="relative">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute -inset-20 bg-gradient-to-r from-[#c8aa6e]/0 via-[#c8aa6e]/20 to-[#c8aa6e]/0 rounded-full blur-3xl opacity-50" />
                                <div className="p-20 bg-black/80 border-[6px] border-[#c8aa6e] rounded-[5rem] backdrop-blur-3xl relative z-10 shadow-[0_0_150px_rgba(200,170,110,0.4)]">
                                    <Crown size={80} className="text-[#c8aa6e] mx-auto mb-8 animate-bounce" />
                                    <div className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[1em] mb-4">TOURNAMENT WINNER</div>
                                    <h2 className="text-8xl font-black text-white uppercase tracking-tighter mb-4">{finalWinner}</h2>
                                    <div className="text-xl font-black text-[#a09b8c] uppercase italic mb-12">THE ZENITH CHAMPION</div>

                                    <div className="bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 rounded-3xl p-8 mb-12">
                                        <div className="text-[10px] font-black text-[#c8aa6e] uppercase mb-4">REWARDS CLAIMED</div>
                                        <div className="flex justify-center gap-12">
                                            <div className="text-center">
                                                <div className="text-4xl font-black text-white">50k</div>
                                                <div className="text-[8px] font-black text-[#5c5b57] uppercase">STAR DUST</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-4xl font-black text-[#0ac8b9]">S1</div>
                                                <div className="text-[8px] font-black text-[#5c5b57] uppercase">ICON</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={() => setStep('REGISTER')} className="w-full btn-hextech-primary py-6 text-xs font-black uppercase tracking-[0.3em] text-black">RETURN TO HUB</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
