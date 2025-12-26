'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, Zap, Sword, Heart } from 'lucide-react';

interface BattleLogProps {
    logs: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogIcon = (text: string) => {
        if (text.includes('Barrier')) return <Shield className="w-4 h-4 text-blue-400" />;
        if (text.includes('Lifesteal') || text.includes('healed')) return <Heart className="w-4 h-4 text-pink-400" />;
        if (text.includes('damage') || text.includes('played unit')) return <Sword className="w-4 h-4 text-red-400" />;
        if (text.includes('cast') || text.includes('spell')) return <Zap className="w-4 h-4 text-cyan-400" />;
        return <Terminal className="w-4 h-4 text-slate-400" />;
    };

    const formatLogText = (text: string) => {
        let formatted = text;
        if (text.includes('[player]')) {
            formatted = formatted.replace('[player]', '<span class="text-blue-400 font-bold">YOU</span>');
        }
        if (text.includes('[opponent]')) {
            formatted = formatted.replace('[opponent]', '<span class="text-red-400 font-bold">OPPONENT</span>');
        }
        return formatted;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/80 border-l border-white/10 backdrop-blur-md overflow-hidden shadow-2xl">
            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .log-entry {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>

            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-transparent">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-200/60 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    BATTLE LOG
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth" ref={scrollRef}>
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div
                            key={`${i}-${log}`}
                            className="log-entry flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
                        >
                            <div className="mt-1 opacity-60">
                                {getLogIcon(log)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-300 leading-snug"
                                    dangerouslySetInnerHTML={{ __html: formatLogText(log) }}
                                />
                                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                                    00:{String(i).padStart(2, '0')} REV
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-black/40 border-t border-white/5">
                <div className="flex gap-2 items-center text-[10px] text-slate-500 font-mono">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE ENGINE FEED
                </div>
            </div>
        </div>
    );
};
