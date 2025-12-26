'use client';

import React from 'react';
import { Shield, Sword, Heart, Zap, FastForward, Wind, Timer, Repeat } from 'lucide-react';

export const KEYWORD_EXPLANATIONS: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
    'Barrier': {
        label: 'Barrier',
        description: 'Negates the next instance of damage this unit would take. Lasts one turn.',
        icon: <Shield className="w-4 h-4 text-blue-400" />
    },
    'Overwhelm': {
        label: 'Overwhelm',
        description: 'Excess damage dealt to a blocker is dealt to the enemy Nexus.',
        icon: <Sword className="w-4 h-4 text-orange-400" />
    },
    'Quick Attack': {
        label: 'Quick Attack',
        description: 'While attacking, strikes before its blocker.',
        icon: <FastForward className="w-4 h-4 text-yellow-400" />
    },
    'Lifesteal': {
        label: 'Lifesteal',
        description: 'Damage dealt by this unit heals its Nexus for the same amount.',
        icon: <Heart className="w-4 h-4 text-pink-400" />
    },
    'Tough': {
        label: 'Tough',
        description: 'Takes 1 less damage from all sources.',
        icon: <Shield className="w-4 h-4 text-slate-400" />
    },
    'Regeneration': {
        label: 'Regeneration',
        description: 'Heals to full health at the start of each turn.',
        icon: <Repeat className="w-4 h-4 text-green-400" />
    },
    'Rush': {
        label: 'Rush',
        description: 'Can attack the same turn it is played.',
        icon: <Zap className="w-4 h-4 text-cyan-400" />
    },
    'Elusive': {
        label: 'Elusive',
        description: 'Can only be blocked by other Elusive units.',
        icon: <Wind className="w-4 h-4 text-purple-400" />
    }
};

interface CardTooltipProps {
    keywords: string[];
}

export const CardTooltip: React.FC<CardTooltipProps> = ({ keywords }) => {
    if (!keywords || keywords.length === 0) return null;

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900/95 border border-[#c8aa6e]/40 p-3 rounded-lg backdrop-blur-xl shadow-2xl z-[100] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="space-y-3">
                {keywords.map(kw => {
                    const info = KEYWORD_EXPLANATIONS[kw];
                    if (!info) return null;
                    return (
                        <div key={kw} className="flex gap-3">
                            <div className="mt-1">{info.icon}</div>
                            <div>
                                <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest">{info.label}</h4>
                                <p className="text-[10px] text-slate-300 leading-tight mt-0.5">{info.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95" />
        </div>
    );
};
