'use client';

import { useGameStore } from '@/store/game-store';
import { Card } from '../Card';
import { useEffect } from 'react';
import clsx from 'clsx';
import { Sparkles, Sword, Shield, Zap } from 'lucide-react';

export function GameBoard() {
    const state = useGameStore();

    // Auto-start for demo
    useEffect(() => {
        state.startGame();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative w-full h-[calc(100vh-6rem)] overflow-hidden bg-black">
            {/* Background: Rift/Map Art */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png')] bg-cover bg-center opacity-40 blur-sm" />

            {/* Vignette & Hextech Patterns */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)]" />
            <div className="absolute inset-0 z-0 border-[20px] border-transparent border-t-[#091428]/80 border-b-[#091428]/80 pointer-events-none" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between p-6">

                {/* --- OPPONENT ZONE --- */}
                <div className="flex flex-col items-center justify-start h-1/3">
                    {/* Opponent Hand (Back of cards) */}
                    <div className="flex -space-x-4 mb-4 transform -translate-y-1/2 opacity-70">
                        {Array.from({ length: state.opponent.handCount }).map((_, i) => (
                            <div key={i} className="w-24 h-36 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500 rounded-lg shadow-2xl skew-x-2 transform scale-75" />
                        ))}
                    </div>

                    {/* Opponent Avatar & Mana */}
                    <div className="flex items-center gap-8 w-full max-w-6xl px-8">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-red-900 border-4 border-slate-700 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                {/* Boss Avatar Placeholder */}
                            </div>
                            <span className="text-red-400 font-bold mt-1 text-lg">{state.opponent.health} HP</span>
                        </div>

                        {/* Opponent Field */}
                        <div className="flex-1 flex justify-center gap-4 h-32 border-2 border-red-500/20 bg-red-900/10 rounded-xl items-center p-2">
                            <p className="text-red-500/30 font-bold uppercase tracking-[0.5em]">Battlefield</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-cyan-400">
                                <Zap className="fill-cyan-400 w-5 h-5" />
                                <span className="font-mono text-xl">{state.opponent.mana}/{state.opponent.maxMana}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BATTLEFIELD DIVIDER (Turn Timer / Interaction) --- */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex justify-center items-center">
                    <button
                        onClick={state.endTurn}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        END TURN
                    </button>
                </div>


                {/* --- PLAYER ZONE --- */}
                <div className="flex flex-col items-center justify-end h-1/2 gap-4">

                    {/* Player Field */}
                    <div className="flex justify-center gap-4 w-full max-w-6xl min-h-[140px] items-center">
                        {state.player.field.length === 0 && (
                            <div className="text-blue-500/30 font-bold uppercase tracking-[0.5em] border-2 border-dashed border-blue-500/30 rounded-xl p-8 w-2/3 text-center">
                                Your Units
                            </div>
                        )}
                        {state.player.field.map((card) => (
                            <div key={card.id + '-field'} className="w-32 transform hover:scale-110 transition-transform cursor-pointer">
                                <Card card={card} />
                            </div>
                        ))}
                    </div>

                    {/* Player Controls & Mana */}
                    <div className="w-full max-w-6xl flex justify-between items-end px-8 relative">

                        {/* Health & Avatar */}
                        <div className="flex flex-col items-center z-20">
                            <span className="text-green-400 font-bold mb-1 text-lg shadow-black drop-shadow-md">{state.player.health} HP</span>
                            <div className="w-24 h-24 rounded-full bg-blue-900 border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center">
                                <span className="text-4xl">🧙‍♂️</span>
                            </div>
                        </div>

                        {/* HAND */}
                        <div className="flex -space-x-8 hover:space-x-2 transition-all duration-300 items-end pb-4 z-30 perspective-[1000px]">
                            {state.player.hand.map((card, i) => {
                                const canPlay = state.player.mana >= card.cost;
                                return (
                                    <div
                                        key={card.id + i}
                                        onClick={() => state.playCard(card.id)}
                                        className={clsx(
                                            "transform transition-all duration-300 origin-bottom hover:-translate-y-10 hover:rotate-0 hover:z-50 cursor-pointer shadow-2xl",
                                            canPlay ? "group-hover:grayscale-0" : "grayscale opacity-80"
                                        )}
                                        style={{
                                            transform: `rotate(${(i - state.player.hand.length / 2) * 5}deg) translateY(${Math.abs((i - state.player.hand.length / 2) * 10)}px)`
                                        }}
                                    >
                                        <Card card={card} />
                                        {canPlay && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                Play
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mana Bar */}
                        <div className="flex flex-col items-center z-20 mb-4 bg-slate-900/80 p-3 rounded-xl border border-blue-500/30 backdrop-blur-md">
                            <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                <Zap className="fill-cyan-400 w-6 h-6 animate-pulse" />
                                <span className="font-mono text-2xl font-bold">{state.player.mana}</span>
                                <span className="text-slate-500 text-lg">/ {state.player.maxMana}</span>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: state.player.maxMana }).map((_, i) => (
                                    <div key={i} className={clsx(
                                        "w-4 h-6 rounded-sm border border-cyan-500/50 transition-all",
                                        i < state.player.mana ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-slate-800"
                                    )} />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
