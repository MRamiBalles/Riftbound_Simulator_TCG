'use client';

import { useGameStore } from '@/store/game-store';
import { Card } from '../Card';
import { useEffect } from 'react';
import clsx from 'clsx';
import { Sparkles, Sword, Shield, Zap, Skull } from 'lucide-react';
import { CombatOverlay } from './CombatOverlay';
import { MOCK_CARDS } from '@/services/card-service';
import { HeuristicBot } from '@/game/ai/HeuristicBot';

// Helper to create a mock deck for now
const createMockDeck = () => Array.from({ length: 30 }, () => MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)]);

export function GameBoard() {
    const {
        players,
        activePlayer,
        phase,
        turn,
        initGame,
        performAction
    } = useGameStore();

    const player = players.player;
    const opponent = players.opponent;

    // AI Integration
    useEffect(() => {
        if (activePlayer === 'opponent' && !players.opponent.winner && !players.player.winner) {
            const bot = new HeuristicBot('opponent');

            // Allow state to update and UI to render "Opponent Turn" before thinking
            const timer = setTimeout(async () => {
                const performBotMove = async () => {
                    // Get latest state
                    const currentState = useGameStore.getState();
                    if (currentState.activePlayer !== 'opponent') return;

                    console.log("Bot thinking...");
                    const action = await bot.decideAction(currentState);
                    console.log("Bot decided:", action);

                    if (action) {
                        performAction(action);

                        // If action wasn't END_TURN, try to act again after delay
                        if (action.type !== 'END_TURN') {
                            setTimeout(performBotMove, 1500);
                        }
                    }
                };

                performBotMove();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [activePlayer, performAction, players.opponent.winner, players.player.winner]);

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
            // Main Phase: Toggle attacker selection (Simplified: Attack alone/immediately for MVP step 1)
            // Ideally we'd have a localized "Selected" state before committing.
            if (phase === 'Main') {
                performAction({ type: 'DECLARE_ATTACKERS', playerId: 'player', attackers: [cardId] });
            }
        }
    };

    return (
        <div className="relative w-full h-[calc(100vh-6rem)] overflow-hidden bg-black font-sans">
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt2a829e1f57fb8b78/62e0339aab625e114008778a/01PZ040-full.png')] bg-cover bg-center opacity-40 blur-sm" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010a13_90%)]" />

            <CombatOverlay />

            <div className="relative z-10 w-full h-full flex flex-col justify-between p-6">

                {/* --- OPPONENT ZONE --- */}
                <div className="flex flex-col items-center justify-start h-1/3">
                    {/* Opponent Hand (Back of cards) */}
                    <div className="flex -space-x-4 mb-4 transform -translate-y-1/2 opacity-70">
                        {Array.from({ length: Math.min(10, opponent.hand.length || opponent.deckCount / 5) }).map((_, i) => (
                            <div key={i} className="w-24 h-36 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500 rounded-lg shadow-2xl skew-x-2 transform scale-75" />
                        ))}
                    </div>

                    <div className="flex items-center gap-8 w-full max-w-6xl px-8">
                        {/* Avatar */}
                        <div className="flex flex-col items-center relative">
                            <div className="w-20 h-20 rounded-full bg-red-900 border-4 border-slate-700 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-20"></div>
                            <span className="text-red-400 font-bold mt-1 text-lg z-20 bg-black/50 px-2 rounded-full border border-red-500/30">{opponent.health} HP</span>
                        </div>

                        {/* Opponent Field */}
                        <div className="flex-1 flex justify-center gap-4 h-32 border-2 border-red-500/20 bg-red-900/10 rounded-xl items-center p-2">
                            {opponent.field.map((card) => (
                                <div key={card.instanceId} className="w-24 transform rotate-180 scale-90">
                                    <Card card={card} />
                                    {/* Stats overlay for runtime values */}
                                    <div className="absolute -bottom-6 w-full flex justify-between px-1 text-xs font-bold text-white bg-black/70 rounded">
                                        <span className="text-yellow-400">⚔️ {card.currentAttack}</span>
                                        <span className="text-red-400">❤️ {card.currentHealth}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mana */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-cyan-400">
                                <Zap className="fill-cyan-400 w-5 h-5" />
                                <span className="font-mono text-xl">{opponent.mana}/{opponent.maxMana}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BATTLEFIELD DIVIDER --- */}
                <div className="absolute top-1/2 left-0 w-full flex justify-center items-center gap-4 pointer-events-none z-20">
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent w-full absolute" />

                    {activePlayer === 'player' && phase === 'Main' && (
                        <button
                            onClick={() => performAction({ type: 'END_TURN', playerId: 'player' })}
                            className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all transform hover:scale-105 active:scale-95"
                        >
                            END TURN
                        </button>
                    )}

                    {activePlayer === 'opponent' && (
                        <div className="bg-red-900/80 text-white px-4 py-1 rounded border border-red-500 animate-pulse">
                            OPPONENT TURN
                        </div>
                    )}
                </div>


                {/* --- PLAYER ZONE --- */}
                <div className="flex flex-col items-center justify-end h-1/2 gap-4">

                    {/* Player Field */}
                    <div className="flex justify-center gap-4 w-full max-w-6xl min-h-[140px] items-center">
                        {player.field.length === 0 && (
                            <div className="text-blue-500/30 font-bold uppercase tracking-[0.5em] border-2 border-dashed border-blue-500/30 rounded-xl p-8 w-2/3 text-center">
                                Your Units
                            </div>
                        )}
                        {player.field.map((card) => (
                            <div
                                key={card.instanceId}
                                onClick={() => handleCardClick(card.instanceId, 'field')}
                                className={clsx(
                                    "w-32 transform transition-transform cursor-pointer relative group",
                                    card.canAttack ? "hover:scale-110 ring-2 ring-yellow-500 rounded-lg" : "hover:scale-105"
                                )}
                            >
                                <Card card={card} />
                                {/* Token/Status Overlay */}
                                <div className="absolute -top-3 -right-3 flex gap-1">
                                    {card.summoningSickness && <span className="text-xl" title="Summoning Sickness">💤</span>}
                                    {card.keywords?.includes('Rush') && <span className="text-xl" title="Rush">⚡</span>}
                                    {card.keywords?.includes('Barrier') && <span className="text-xl" title="Barrier">🛡️</span>}
                                </div>

                                {/* Runtime Stats */}
                                <div className="absolute -bottom-3 w-full flex justify-between px-2 text-sm font-bold text-white shadow-black drop-shadow-md z-10">
                                    <span className="bg-yellow-600 px-1 rounded border border-yellow-400">{card.currentAttack}</span>
                                    <span className="bg-red-600 px-1 rounded border border-red-400">{card.currentHealth}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Player Controls & Mana */}
                    <div className="w-full max-w-6xl flex justify-between items-end px-8 relative">

                        {/* Health & Avatar */}
                        <div className="flex flex-col items-center z-20">
                            <span className="text-green-400 font-bold mb-1 text-lg shadow-black drop-shadow-md">{player.health} HP</span>
                            <div className="w-24 h-24 rounded-full bg-blue-900 border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center relative overflow-hidden">
                                <span className="text-4xl relative z-10">🧙‍♂️</span>
                                <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                            </div>
                        </div>

                        {/* HAND */}
                        <div className="flex -space-x-8 hover:space-x-2 transition-all duration-300 items-end pb-4 z-30 perspective-[1000px]">
                            {player.hand.map((card, i) => {
                                const canPlay = player.mana >= card.currentCost && activePlayer === 'player' && phase !== 'Combat';
                                return (
                                    <div
                                        key={card.instanceId}
                                        onClick={() => handleCardClick(card.instanceId, 'hand')}
                                        className={clsx(
                                            "transform transition-all duration-300 origin-bottom hover:-translate-y-12 hover:rotate-0 hover:z-50 cursor-pointer shadow-2xl relative",
                                            canPlay ? "group-hover:grayscale-0" : "grayscale opacity-80"
                                        )}
                                        style={{
                                            transform: `rotate(${(i - player.hand.length / 2) * 5}deg) translateY(${Math.abs((i - player.hand.length / 2) * 10)}px)`
                                        }}
                                    >
                                        <Card card={card} />
                                        {canPlay && (
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                Play ({card.currentCost})
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
                                <span className="font-mono text-2xl font-bold">{player.mana}</span>
                                <span className="text-slate-500 text-lg">/ {player.maxMana}</span>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className={clsx(
                                        "w-3 h-5 rounded-sm border transition-all",
                                        i < player.mana ? "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" :
                                            i < player.maxMana ? "bg-slate-700 border-slate-600" : "bg-slate-900 border-slate-800 opacity-50"
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
