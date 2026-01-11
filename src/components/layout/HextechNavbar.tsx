'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Trophy, ShoppingBag, Cpu, Users, Settings } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
    { label: 'PLAY', href: '/play', icon: Sparkles, primary: true },
    { label: 'COLLECTION', href: '/collection', icon: Trophy },
    { label: 'MARKET', href: '/marketplace', icon: ShoppingBag },
    { label: 'AI NEXUS', href: '/ai', icon: Cpu },
    { label: 'SOCIAL', href: '/social', icon: Users },
];

export const HextechNavbar: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 w-full z-50 h-16 glass-hextech border-b border-[#c8aa6e]/30 flex items-center px-8 justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-12">
                <Link href="/" className="group">
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-[#c8aa6e] group-hover:text-[#f0e6d2] transition-colors" style={{ fontFamily: 'Beaufort' }}>
                        RIFTBOUND
                    </h1>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center h-full">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={clsx(
                                    "px-6 h-16 flex items-center gap-2 text-xs font-bold tracking-widest transition-all relative group",
                                    item.primary ? "text-[#0ac8b9] hover:text-[#0ef3e1]" : "text-[#a09b8c] hover:text-[#f0e6d2]",
                                    isActive && "text-white"
                                )}
                            >
                                <Icon size={16} className={clsx(isActive ? "animate-pulse" : "opacity-60 group-hover:opacity-100")} />
                                <span>{item.label}</span>

                                {isActive && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#c8aa6e] to-transparent shadow-[0_0_10px_#c8aa6e]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Profile / Currency */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-black/40 border border-[#c8aa6e]/20">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#0ac8b9] shadow-[0_0_8px_#0ac8b9]" />
                        <span className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-tighter">4,250 BE</span>
                    </div>
                </div>

                <div className="relative group">
                    <div className="w-10 h-10 rounded-full border-2 border-[#c8aa6e] overflow-hidden hover:border-[#f0e6d2] transition-colors cursor-pointer bg-slate-900">
                        <img
                            src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/5030.jpg"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#010a13]" />
                </div>

                <button className="text-[#a09b8c] hover:text-white transition-colors">
                    <Settings size={18} />
                </button>
            </div>
        </nav>
    );
};
