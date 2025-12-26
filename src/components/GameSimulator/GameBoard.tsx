import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { Card } from '../Card';
import clsx from 'clsx';
import { Sparkles, Sword, Shield, Zap, Skull, RefreshCcw } from 'lucide-react';
import { CombatOverlay } from './CombatOverlay';
import { Action, PlayerId } from '@/game/engine/game.types';
import { MOCK_CARDS } from '@/services/card-service';
import { BattleLog } from '@/components/game/BattleLog';
import { soundService } from '@/services/sound-service';

// Helper to create a mock deck for now
const createMockDeck = () => Array.from({ length: 30 }, () => MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)]);

import { ReplayOverlay } from '../game/ReplayOverlay';
import { ReplayService } from '@/services/replay-service';
import { useSearchParams } from 'next/navigation';

export const GameBoard: React.FC = () => {
    const searchParams = useSearchParams();
    const {
        engine,
        players,
        activePlayer,
        phase,
        turn,
        priority,
        log,
        combat,
        winner,
        initGame,
        performAction,
        fetchInferenceAction,
        isReplayMode,
        loadReplay
    } = useGameStore();

    // Check for replay in URL
    useEffect(() => {
        const replayData = searchParams.get('replay');
        if (replayData && !isReplayMode) {
            try {
                const decoded = ReplayService.deserialize(replayData);
                loadReplay(decoded);
            } catch (e) {
                console.error('Failed to load replay from URL', e);
            }
        }
    }, [searchParams, loadReplay, isReplayMode]);

    const [selectedMulliganIds, setSelectedMulliganIds] = useState<string[]>([]);

    const player = players.player;
    const opponent = players.opponent;

    // AI Integration
    useEffect(() => {
        if (activePlayer === 'opponent' && !winner && phase === 'Main') {
            const timer = setTimeout(async () => {
                await fetchInferenceAction();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [activePlayer, fetchInferenceAction, winner, phase]);

    // Auto-start
    useEffect(() => {
        if (turn === 0) {
            initGame(createMockDeck(), createMockDeck());
        }
    }, [turn, initGame]);

    const handleCardClick = (cardId: string, location: 'hand' | 'field') => {
        if (activePlayer !== 'player') return;

        if (location === 'hand') {
            performAction({ type: 'PLAY_CARD', playerId: 'player', cardId });
        } else if (location === 'field') {
            if (phase === 'Main') {
                performAction({ type: 'DECLARE_ATTACKERS', playerId: 'player', attackers: [cardId] });
            }
        }
    };

    const toggleMulligan = (id: string) => {
        setSelectedMulliganIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAction = (action: Action) => {
        // Play appropriate sound
        if (action.type === 'PLAY_CARD') soundService.play('CARD_PLAY');
        else if (action.type === 'DECLARE_ATTACKERS') soundService.play('ATTACK_LIGHT');
        else if (action.type === 'END_TURN') soundService.play('HEX_UI_OPEN');
        else soundService.play('CLICK');

        performAction(action);
    };

    const confirmMulligan = () => {
        handleAction({
            type: 'SELECT_MULLIGAN',
            playerId: 'player',
            mulliganCards: selectedMulliganIds
        });
    };

    return (
        <div className="relative w-full h-[calc(100vh-6rem)] overflow-hidden bg-black font-sans">
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse-gold { 0% { box-shadow: 0 0 0 0 rgba(200, 170, 110, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(200, 170, 110, 0); } 100% { box-shadow: 0 0 0 0 rgba(200, 170, 110, 0); } }
                .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                .slide-up { animation: slideUp 0.4s ease-out forwards; }
                .mulligan-card-swapping { filter: grayscale(1) opacity(0.5); transform: translateY(-32px) scale(0.9); }
            `}</style>

            {/* Background */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png')] bg-cover bg-center opacity-40 blur-sm" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)]" />

            <CombatOverlay />

            {/* --- MULLIGAN OVERLAY --- */}
            {phase === 'Mulligan' && (
                <div className="fade-in absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
                    <div className="slide-up text-center p-8 lg:p-12 border-2 border-[#c8aa6e]/30 rounded-3xl bg-[#010a13] shadow-[0_0_100px_rgba(200,170,110,0.1)] max-w-5xl w-full">
                        <h2 className="text-4xl font-black text-[#c8aa6e] uppercase tracking-tighter mb-2">
                            Tactical Mulligan
                        </h2>
                        <p className="text-[#a09b8c] mb-10 text-sm tracking-wide">Select cards to swap back into your deck.</p>

                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            {player.hand.map((card) => (
                                <div
                                    key={card.instanceId}
                                    onClick={() => toggleMulligan(card.instanceId)}
                                    className="relative group cursor-pointer"
                                >
                                    <div className={clsx(
                                        "transition-all duration-300 transform",
                                        selectedMulliganIds.includes(card.instanceId) ? "mulligan-card-swapping" : "hover:scale-105"
                                    )}>
                                        <Card card={card} />
                                    </div>
                                    {selectedMulliganIds.includes(card.instanceId) && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-[#c8aa6e] text-black p-2 rounded-full shadow-[0_0_20px_#c8aa6e]">
                                                <RefreshCcw className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 text-[10px] font-bold text-[#c8aa6e]/40 group-hover:text-[#c8aa6e] transition-colors">
                                        {selectedMulliganIds.includes(card.instanceId) ? 'WILL SWAP' : 'KEEPING'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={confirmMulligan}
                            className="group relative px-16 py-5 overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(200,170,110,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#c8aa6e] to-[#7a5c29]" />
                            <span className="relative text-black font-black uppercase tracking-[0.2em] text-sm">Initiate Simulation</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full h-full flex flex-row">
                {/* --- MAIN GAME AREA --- */}
                <div className="flex-1 flex flex-col justify-between p-6">

                    {/* --- OPPONENT ZONE --- */}
                    <div className="flex flex-col items-center justify-start h-1/3">
                        <div className="flex -space-x-4 mb-4 transform -translate-y-1/2 opacity-50">
                            {Array.from({ length: Math.min(10, opponent.hand.length || 5) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-16 h-24 bg-gradient-to-br from-indigo-950 to-black border border-indigo-500/30 rounded-md shadow-2xl origin-top transition-all"
                                    style={{ animation: `slideUp 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-8 w-full max-w-6xl px-8">
                            <div className="flex flex-col items-center relative">
                                <div
                                    className="w-16 h-16 rounded-full bg-red-950 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] z-20 flex items-center justify-center animate-pulse"
                                >
                                    <span className="text-2xl">💀</span>
                                </div>
                                <span className="text-red-400 font-black mt-2 text-xl z-20 font-mono tracking-tighter">{opponent.health} HP</span>
                            </div>

                            <div className="flex-1 flex justify-center gap-4 h-36 border border-white/5 bg-white/5 backdrop-blur-sm rounded-2xl items-center p-4">
                                {opponent.field.map((card) => (
                                    <div
                                        key={card.instanceId}
                                        className="w-24 relative transform scale-90 rotate-y-180 transition-all duration-500"
                                    >
                                        <Card card={card} />
                                        <div className="absolute -bottom-6 w-full flex justify-between px-1 text-[10px] font-black text-white bg-black/80 rounded border border-white/10">
                                            <span className="text-yellow-400">ATK {card.currentAttack}</span>
                                            <span className="text-red-400">HP {card.currentHealth}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="w-24 flex flex-col items-center gap-2">
                                <div className="text-cyan-400 flex flex-col items-center">
                                    <Zap className="fill-cyan-400 w-5 h-5 mb-1 animate-pulse" />
                                    <span className="font-mono text-xl font-bold">{opponent.mana}</span>
                                    <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-500"
                                            style={{ width: `${(opponent.mana / (opponent.maxMana || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- BATTLEFIELD DIVIDER --- */}
                    <div className="relative h-px w-full flex justify-center items-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="z-30 flex gap-4 text-center">
                            {activePlayer === 'player' && phase === 'Main' && (
                                <button
                                    onClick={() => performAction({ type: 'END_TURN', playerId: 'player' })}
                                    className="bg-blue-600/90 text-white font-black py-2 px-10 rounded-full border border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all uppercase tracking-widest text-xs hover:scale-105 active:scale-95"
                                >
                                    End Priority
                                </button>
                            )}

                            {activePlayer === 'opponent' && (
                                <div className="bg-red-900/40 text-red-200 px-6 py-2 rounded-full border border-red-500/50 backdrop-blur-md text-xs font-bold uppercase tracking-widest animate-pulse">
                                    Strategic Analysis In Progress
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- PLAYER ZONE --- */}
                    <div className="flex flex-col items-center justify-end h-1/2 gap-8">

                        {/* Player Field */}
                        <div className="flex justify-center gap-6 w-full max-w-6xl min-h-[160px] items-center px-4">
                            {player.field.map((card) => (
                                <div
                                    key={card.instanceId}
                                    onClick={() => handleCardClick(card.instanceId, 'field')}
                                    className={clsx(
                                        "w-32 transform transition-all cursor-pointer relative group slide-up",
                                        (!card.summoningSickness && !card.hasAttacked) ? "ring-2 ring-blue-500 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)]" : "",
                                        card.hasAttacked && "opacity-60 grayscale-[0.5]"
                                    )}
                                >
                                    <Card card={card} />

                                    {/* Keyword Badges */}
                                    <div className="absolute -top-4 -right-2 flex flex-col gap-1 z-20">
                                        {card.isBarrierActive && (
                                            <div className="bg-blue-500 p-1 rounded-full border border-white/50 shadow-[0_0_10px_#3b82f6] animate-pulse">
                                                <Shield className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Runtime Stats */}
                                    <div className="absolute -bottom-4 w-full flex justify-between px-2 z-20">
                                        <span className="bg-slate-900 border border-yellow-500/50 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-black">{card.currentAttack}</span>
                                        <span className="bg-slate-900 border border-red-500/50 text-red-500 px-2 py-0.5 rounded text-[10px] font-black">{card.currentHealth}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Player Controls */}
                        <div className="w-full max-w-7xl flex justify-between items-end px-12 relative">

                            {/* Avatar */}
                            <div className="flex flex-col items-center z-20 mb-4">
                                <div
                                    className="w-20 h-20 rounded-full bg-gradient-to-b from-blue-600 to-indigo-900 border-2 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center relative group hover:scale-110 transition-transform cursor-pointer"
                                >
                                    <span className="text-3xl filter drop-shadow-lg group-hover:drop-shadow-[0_0_10px_white] transition-all">🧙‍♂️</span>
                                    <div className="absolute inset-0 bg-blue-400/10 rounded-full animate-ping" />
                                </div>
                                <span className="text-blue-200 font-black mt-3 text-xl tracking-tighter shadow-black drop-shadow-md">{player.health} HP</span>
                            </div>

                            {/* HAND */}
                            <div className="flex -space-x-12 hover:space-x-2 transition-all duration-500 items-end pb-8 z-30 px-12">
                                {player.hand.map((card, i) => {
                                    const canPlay = player.mana >= card.currentCost && activePlayer === 'player' && phase === 'Main';
                                    return (
                                        <div
                                            key={card.instanceId}
                                            onClick={() => handleCardClick(card.instanceId, 'hand')}
                                            className={clsx(
                                                "cursor-pointer shadow-2xl relative transition-all duration-300 origin-bottom hover:-translate-y-24 hover:scale-125 hover:z-50 hover:rotate-0",
                                                !canPlay && "grayscale opacity-60"
                                            )}
                                            style={{
                                                transform: `rotate(${(i - player.hand.length / 2) * 4}deg) translateY(${Math.abs((i - player.hand.length / 2) * 8)}px)`
                                            }}
                                        >
                                            <Card card={card} />
                                            {canPlay && (
                                                <div
                                                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black px-3 py-1 rounded shadow-[0_0_15px_#06b6d4] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Invoke ({card.currentCost})
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mana System */}
                            <div className="flex flex-col items-end z-20 mb-8 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3 text-cyan-400 mb-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-cyan-400/50 uppercase tracking-[0.3em]">Neural Link</span>
                                        <span className="font-mono text-3xl font-black">{player.mana}/{player.maxMana}</span>
                                    </div>
                                    <Zap className="fill-cyan-400 w-8 h-8 drop-shadow-[0_0_10px_#06b6d4] animate-pulse" />
                                </div>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className={clsx(
                                            "w-2.5 h-6 rounded-sm border transition-all duration-500",
                                            i < player.mana ? "bg-cyan-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]" :
                                                i < player.maxMana ? "bg-slate-800 border-slate-700" : "bg-black/50 border-white/5"
                                        )} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR (Battle Log) --- */}
                <aside className="w-80 h-full border-l border-white/10 hidden xl:block">
                    <BattleLog logs={log} />
                </aside>
            </div>
            {/* Replay Controls */}
            <ReplayOverlay />
        </div>
    );
};

