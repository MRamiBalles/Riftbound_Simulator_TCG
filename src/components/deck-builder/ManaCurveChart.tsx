'use client';

import React from 'react';

interface ManaCurveChartProps {
    deck: Record<string, number>;
    cards: any[];
}

export const ManaCurveChart: React.FC<ManaCurveChartProps> = ({ deck, cards }) => {
    // Calculate counts per cost (0-8+)
    const curve = Array(9).fill(0);
    Object.entries(deck).forEach(([cardId, count]) => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
            const cost = Math.min(card.cost, 8);
            curve[cost] += count;
        }
    });

    const maxCount = Math.max(...curve, 1);

    return (
        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl backdrop-blur-sm">
            <h3 className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mb-4 flex justify-between items-center">
                Mana Distribution
                <span className="text-slate-500 font-mono italic">Optimal Curve: Midrange</span>
            </h3>

            <div className="flex items-end justify-between h-24 gap-1 px-1">
                {curve.map((count, i) => {
                    const height = (count / maxCount) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group">
                            <div className="w-full relative flex flex-col justify-end h-20">
                                {/* Tooltip */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-black text-[10px] font-black px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {count} Cards
                                </div>

                                {/* Bar */}
                                <div
                                    className="w-full bg-gradient-to-t from-blue-900/40 to-blue-400/80 rounded-t-sm border-x border-t border-blue-400/30 transition-all duration-700 ease-out"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="w-full h-full bg-blue-400/20 animate-pulse" />
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 mt-2">
                                {i === 8 ? '8+' : i}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
