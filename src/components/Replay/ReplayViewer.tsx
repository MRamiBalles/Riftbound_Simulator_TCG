'use client';

import { useState, useEffect, useMemo } from 'react';
import { CoreEngine } from '@/game/engine/CoreEngine';
import { ReplayData } from '@/services/replay-service';
import { MOCK_CARDS, createDeckFromCardIds } from '@/services/card-service';
import { Card } from '../Card';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { PlayerId, SerializedGameState } from '@/game/engine/game.types';

export interface ReplayViewerProps {
    replay: ReplayData;
}

export function ReplayViewer({ replay }: ReplayViewerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Reconstruct game states for each step
    const gameStates = useMemo(() => {
        const engine = new CoreEngine();
        const p1Deck = createDeckFromCardIds(replay.playerDeck);
        const p2Deck = createDeckFromCardIds(replay.opponentDeck);

        engine.initGame(p1Deck, p2Deck, replay.seed);

        const states: SerializedGameState[] = [engine.getState()];

        replay.actions.forEach(action => {
            engine.applyAction(action);
            states.push(engine.getState());
        });

        return states;
    }, [replay]);

    const currentState = gameStates[currentStep];

    useEffect(() => {
        let interval: any;
        if (isPlaying && currentStep < gameStates.length - 1) {
            interval = setInterval(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000);
        } else {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep, gameStates.length]);

    const formatAction = (idx: number) => {
        if (idx === 0) return 'Start of Game';
        const action = replay.actions[idx - 1];
        return `[${action.playerId}] ${action.type}`;
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-950 text-white rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header / Timeline */}
            <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RotateCcw size={20} className="text-cyan-400" />
                    </button>
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg shadow-cyan-900/40"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button
                        onClick={() => setCurrentStep(prev => Math.min(gameStates.length - 1, prev + 1))}
                        disabled={currentStep === gameStates.length - 1}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="flex-1 px-8">
                    <div className="flex justify-between text-xs text-cyan-400/60 mb-1 font-mono">
                        <span>STEP {currentStep}</span>
                        <span>{Math.round((currentStep / (gameStates.length - 1)) * 100)}%</span>
                        <span>{formatAction(currentStep)}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={gameStates.length - 1}
                        value={currentStep}
                        onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Replay Theater</div>
                    <div className="text-[10px] text-white/40 font-mono">{replay.id.slice(0, 8)} | {new Date(replay.date).toLocaleDateString()}</div>
                </div>
            </div>

            {/* Board Preview (Simplified) */}
            <div className="flex-1 relative overflow-hidden bg-slate-900 p-8 grid grid-rows-[auto_1fr_auto] gap-8">
                {/* Opponent Hand/Field */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center gap-2 opacity-60">
                        {currentState.players.opponent.hand.map((c, i) => (
                            <div key={i} className="w-12 h-16 bg-slate-800 rounded border border-white/10" />
                        ))}
                    </div>
                    <div className="flex justify-center gap-4">
                        {currentState.players.opponent.field.map((c: any) => (
                            <div key={c.instanceId} className="scale-75 origin-top">
                                <Card card={c} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center / Versus */}
                <div className="flex items-center justify-between border-y border-white/5 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-xl font-bold bg-red-950/40">
                            {currentState.players.opponent.health}
                        </div>
                        <div className="text-xs uppercase text-red-500/60 font-bold">Opponent Health</div>
                    </div>

                    <div className="text-2xl font-black text-white/10 italic tracking-tighter">VERSUS REPLAY</div>

                    <div className="flex items-center gap-4 text-right">
                        <div className="text-xs uppercase text-cyan-500/60 font-bold">Player Health</div>
                        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-xl font-bold bg-cyan-950/40">
                            {currentState.players.player.health}
                        </div>
                    </div>
                </div>

                {/* Player Hand/Field */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center gap-4">
                        {currentState.players.player.field.map((c: any) => (
                            <div key={c.instanceId} className="scale-75 origin-bottom">
                                <Card card={c} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-2">
                        {currentState.players.player.hand.map((c: any) => (
                            <div key={c.instanceId} className="scale-50 origin-bottom -mx-4 group hover:z-10 transition-transform">
                                <Card card={c} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
