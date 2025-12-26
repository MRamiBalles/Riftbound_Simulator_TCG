'use client';

import React, { useState } from 'react';
import { useGuildStore, GuildMember } from '@/store/guild-store';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Sword, Crown, Zap, Sparkles, MessageSquare, Terminal, Plus, History, Landmark, Target } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function GuildPage() {
    const { guild, createGuild, joinGuild, leaveGuild, contribute, updateMotd } = useGuildStore();
    const { wonderShards, starDust, addWonderShards, addStarDust } = useUserStore();

    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [showContribute, setShowContribute] = useState(false);

    const handleCreate = () => {
        if (name && tag) {
            createGuild(name, tag);
            setIsCreating(false);
        }
    };

    const handleContribute = (amount: number, type: 'SHARDS' | 'DUST') => {
        if (type === 'SHARDS') {
            if (wonderShards >= amount) {
                addWonderShards(-amount);
                contribute(amount, 0);
            }
        } else {
            if (starDust >= amount) {
                addStarDust(-amount);
                contribute(0, amount);
            }
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {!guild ? (
                        <motion.div key="none" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[70vh] gap-12 text-center">
                            <header>
                                <div className="w-32 h-32 rounded-full border-4 border-[#c8aa6e]/20 flex items-center justify-center bg-[#c8aa6e]/5 mx-auto mb-8">
                                    <Shield size={64} className="text-[#c8aa6e]" />
                                </div>
                                <h1 className="text-8xl font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'Beaufort' }}>GUILD COUNCIL</h1>
                                <p className="text-[#c8aa6e] text-sm font-black uppercase tracking-[0.5em] mt-4">JOIN THE DIMENSIONAL ALLIANCE</p>
                            </header>

                            <div className="flex gap-8 max-w-4xl w-full">
                                <div className="bg-black/40 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-xl flex-1 group hover:border-[#c8aa6e]/30 transition-all cursor-pointer" onClick={() => setIsCreating(true)}>
                                    <Plus size={48} className="text-[#c8aa6e] mx-auto mb-6 group-hover:rotate-90 transition-transform" />
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">FOUND A GUILD</h2>
                                    <p className="text-xs text-[#5c5b57] mt-3 uppercase tracking-widest">LEAD YOUR OWN FACTION</p>
                                </div>
                                <div className="bg-black/40 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-xl flex-1 group hover:border-[#0ac8b9]/30 transition-all cursor-pointer" onClick={() => joinGuild('VOID_1')}>
                                    <Users size={48} className="text-[#0ac8b9] mx-auto mb-6 group-hover:scale-110 transition-transform" />
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">JOIN ALLIANCE</h2>
                                    <p className="text-xs text-[#5c5b57] mt-3 uppercase tracking-widest">FIND YOUR PLACE IN THE RIFT</p>
                                </div>
                            </div>

                            {isCreating && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-black/80 border border-white/10 rounded-[2.5rem] mt-8 w-full max-w-md">
                                    <input placeholder="GUILD NAME" className="bg-white/5 border border-white/10 w-full p-4 rounded-xl text-white font-black mb-4 focus:border-[#c8aa6e] outline-none" onChange={e => setName(e.target.value)} />
                                    <input placeholder="TAG (3-4 CHARS)" maxLength={4} className="bg-white/5 border border-white/10 w-full p-4 rounded-xl text-white font-black mb-6 focus:border-[#c8aa6e] outline-none" onChange={e => setTag(e.target.value)} />
                                    <button onClick={handleCreate} className="w-full btn-hextech-primary py-4 text-xs font-black uppercase tracking-widest">CREATE FOR 1,000 SHARDS</button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <header className="mb-12 flex justify-between items-end bg-black/40 border border-white/5 p-10 rounded-[4rem] backdrop-blur-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <Shield size={200} className="text-[#c8aa6e]" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="px-3 py-1 bg-[#c8aa6e]/10 text-[#c8aa6e] text-[10px] font-black rounded-lg border border-[#c8aa6e]/20">LEVEL {guild.level}</span>
                                        <span className="text-[#5c5b57] font-black text-[10px] uppercase tracking-widest">[{guild.tag}]</span>
                                    </div>
                                    <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-none" style={{ fontFamily: 'Beaufort' }}>{guild.name}</h1>
                                    <p className="text-[#c8aa6e] text-xs font-black uppercase tracking-[0.3em] mt-4 italic">"{guild.motd}"</p>
                                </div>

                                <div className="flex gap-12 relative z-10">
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-[#5c5b57] uppercase mb-1">MEMBERS</div>
                                        <div className="text-3xl font-black text-white">{guild.members.length} / 50</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-[#c8aa6e] uppercase mb-1">VAULT SHARDS</div>
                                        <div className="text-3xl font-black text-white">{guild.vault.shards.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-[#0ac8b9] uppercase mb-1">VAULT DUST</div>
                                        <div className="text-3xl font-black text-white">{guild.vault.dust.toLocaleString()}</div>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-12 gap-8">
                                {/* LEFT: ROSTER */}
                                <div className="col-span-8 bg-black/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                            <Users size={24} className="text-[#c8aa6e]" /> ALLIANCE ROSTER
                                        </h2>
                                        <button className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest hover:text-white transition-colors">VIEW ALL HISTORY</button>
                                    </div>

                                    <div className="space-y-4">
                                        {guild.members.sort((a, b) => b.contribution - a.contribution).map(member => (
                                            <div key={member.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#010a13] border border-white/10 flex items-center justify-center font-black text-[#c8aa6e]">
                                                        {member.role === 'LEADER' ? <Crown size={20} /> : member.role === 'OFFICER' ? <Shield size={20} /> : member.name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                            {member.name}
                                                            {member.name === 'User' && <span className="text-[8px] px-2 py-0.5 bg-[#0ac8b9]/20 text-[#0ac8b9] rounded-full">YOU</span>}
                                                        </div>
                                                        <div className="text-[10px] font-black text-[#5c5b57] uppercase tracking-widest mt-1">{member.role}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-white">{member.contribution.toLocaleString()}</div>
                                                    <div className="text-[8px] font-black text-[#5c5b57] uppercase mt-1">TOTAL CONTRIBUTION</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* RIGHT: ACTIONS & PERKS */}
                                <div className="col-span-4 space-y-8">
                                    <div className="bg-gradient-to-br from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/20 p-10 rounded-[3.5rem] backdrop-blur-xl">
                                        <Landmark size={32} className="text-[#c8aa6e] mb-6" />
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">GUILD VAULT</h3>
                                        <p className="text-xs text-[#a09b8c] mb-8 leading-relaxed italic">"Contribute resources to level up the guild and unlock exclusive dimensional perks."</p>

                                        <div className="space-y-4">
                                            <button onClick={() => handleContribute(100, 'SHARDS')} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:bg-[#c8aa6e]/10 transition-all">
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest">DONATE 100 SHARDS</span>
                                                <Zap size={16} className="text-[#c8aa6e]" />
                                            </button>
                                            <button onClick={() => handleContribute(500, 'DUST')} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:bg-[#0ac8b9]/10 transition-all">
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest">DONATE 500 DUST</span>
                                                <Sparkles size={16} className="text-[#0ac8b9]" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-black/80 border border-white/5 p-10 rounded-[3.5rem] backdrop-blur-xl group hover:border-red-500/20 transition-all relative overflow-hidden">
                                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Target size={32} className="text-red-500 mb-6" />
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">WAR ROOM</h3>
                                        <p className="text-xs text-[#5c5b57] mb-8 tracking-widest uppercase font-black">LOCKED · LVL 10 REQUIRED</p>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500/40 w-1/4" />
                                        </div>
                                    </div>

                                    <button onClick={leaveGuild} className="w-full p-6 text-[10px] font-black text-[#5c5b57] uppercase tracking-[0.4em] hover:text-red-500 transition-colors">ABANDON ALLIANCE</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
