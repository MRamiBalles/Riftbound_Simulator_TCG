'use client';

import React from 'react';
import { Users, Search, MessageSquare, ShieldCheck, Gamepad2 } from 'lucide-react';
import clsx from 'clsx';

const FRIENDS = [
    { name: 'KaisaMain', status: 'In Game', level: 254, icon: '5031' },
    { name: 'RiftWalker', status: 'Online', level: 128, icon: '5032' },
    { name: 'ToughGuy', status: 'Away', level: 42, icon: '5033' },
    { name: 'ShadowNinja', status: 'Offline', level: 310, icon: '5034' },
];

export const HextechSidebar: React.FC = () => {
    return (
        <aside className="fixed right-0 top-16 bottom-0 w-72 glass-hextech border-l border-[#c8aa6e]/30 p-6 flex flex-col z-40 hidden xl:flex backdrop-blur-xl">
            {/* Header / Social Icons */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex gap-4">
                    <Users size={18} className="text-[#c8aa6e]" />
                    <MessageSquare size={18} className="text-[#a09b8c] hover:text-[#f0e6d2] cursor-pointer" />
                    <ShieldCheck size={18} className="text-[#a09b8c] hover:text-[#f0e6d2] cursor-pointer" />
                </div>
                <div className="relative group">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#5c5b57]" />
                    <input
                        type="text"
                        placeholder="SEARCH"
                        className="bg-black/40 border border-white/5 pl-8 pr-2 py-1 text-[8px] font-bold tracking-widest text-[#f0e6d2] w-24 group-focus-within:w-32 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin">
                <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-[0.2em] mb-2 px-2">Social — 4</div>

                {FRIENDS.map((friend) => (
                    <div key={friend.name} className="group flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full border border-[#c8aa6e]/30 overflow-hidden bg-slate-900 group-hover:border-[#c8aa6e]">
                                <img
                                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${friend.icon}.jpg`}
                                    alt={friend.name}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0"
                                />
                            </div>
                            <div className={clsx(
                                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#010a13]",
                                friend.status === 'Online' ? "bg-green-500" :
                                    friend.status === 'In Game' ? "bg-[#0ac8b9]" :
                                        friend.status === 'Away' ? "bg-amber-500" : "bg-gray-600"
                            )} />
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#f0e6d2] group-hover:text-white transition-colors">{friend.name}</span>
                                <span className="text-[8px] text-[#5c5b57]">Lvl {friend.level}</span>
                            </div>
                            <span className={clsx(
                                "text-[9px] uppercase tracking-tighter font-bold",
                                friend.status === 'In Game' ? "text-[#0ac8b9]" : "text-[#a09b8c]"
                            )}>
                                {friend.status}
                            </span>
                        </div>

                        {friend.status === 'In Game' && (
                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Gamepad2 size={14} className="text-[#0ac8b9] animate-bounce" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Status */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="bg-black/40 p-3 rounded border border-[#c8aa6e]/10 flex flex-col gap-1">
                    <div className="text-[8px] font-black text-amber-500 uppercase">System Intelligence</div>
                    <div className="text-[10px] font-bold text-[#f0e6d2] flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        Aramis Engine Online
                    </div>
                </div>
            </div>
        </aside>
    );
};
