'use client';

import React, { useState } from 'react';
import { useGuildStore } from '@/store/guild-store';
import { useMissionStore } from '@/store/mission-store';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import { Shield, Users, Trophy, Star, ChevronRight, LayoutGrid, CheckCircle2, Lock, Zap, Target, MessageSquare } from 'lucide-react';
import { SocialLobby } from '@/components/social/SocialLobby';
import Link from 'next/link';
import clsx from 'clsx';

export default function LiveHubPage() {
    const [activeTab, setActiveTab] = useState<'GUILDS' | 'PASS' | 'SOCIAL'>('PASS');
    const { userGuild, availableGuilds, joinGuild } = useGuildStore();
    const { activeMissions, level, currentXP, requiredXP, passTiers } = useMissionStore();

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-[clamp(1rem,5vw,4rem)] overflow-x-hidden">
            <HextechNavbar />
            <HextechSidebar />

            <header className="max-w-[100rem] mx-auto mb-12">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] uppercase mb-4" style={{ fontFamily: 'Beaufort' }}>
                    Infinite Horizon
                </h1>
                <div className="flex gap-8 border-b border-white/5 pb-4">
                    <button
                        onClick={() => setActiveTab('PASS')}
                        className={clsx(
                            "text-sm font-black uppercase tracking-[0.3em] pb-4 transition-all relative",
                            activeTab === 'PASS' ? "text-[#c8aa6e]" : "text-[#5c5b57] hover:text-[#a09b8c]"
                        )}
                    >
                        Celestial Pass
                        {activeTab === 'PASS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#c8aa6e] shadow-[0_0_10px_#c8aa6e]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('GUILDS')}
                        className={clsx(
                            "text-sm font-black uppercase tracking-[0.3em] pb-4 transition-all relative",
                            activeTab === 'GUILDS' ? "text-[#c8aa6e]" : "text-[#5c5b57] hover:text-[#a09b8c]"
                        )}
                    >
                        Guild Unions
                        {activeTab === 'GUILDS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#c8aa6e] shadow-[0_0_10px_#c8aa6e]" />}
                    </button>
                </div>
            </header>

            <section className="max-w-[100rem] mx-auto">
                {activeTab === 'PASS' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-12">
                        {/* LEFT: PROGRESS & MISSIONS */}
                        <div className="lg:col-span-1 2xl:col-span-2 space-y-12">
                            {/* Current Level HUD */}
                            <div className="bg-[#091428]/60 border border-[#c8aa6e]/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Trophy size={160} />
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 rounded-full border-4 border-[#c8aa6e] flex items-center justify-center bg-black/40 shadow-[0_0_30px_rgba(200,170,110,0.3)]">
                                        <span className="text-4xl font-black font-mono text-[#c8aa6e]">{level}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold uppercase tracking-widest text-[#f0e6d2]">Current Tier</h3>
                                        <p className="text-[#a09b8c] text-xs font-bold uppercase tracking-widest">{currentXP} / {requiredXP} XP TO NEXT LEVEL</p>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#7a5c29] via-[#c8aa6e] to-[#7a5c29] animate-[shimmer_3s_infinite]"
                                        style={{ width: `${(currentXP / requiredXP) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Active Missions */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-xs font-black text-[#5c5b57] uppercase tracking-[0.4em]">
                                    <Target size={14} /> Active Recon Missions
                                </h4>
                                {activeMissions.map(m => (
                                    <div key={m.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                                        <div className="flex gap-6 items-center">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-xl flex items-center justify-center border",
                                                m.completed ? "bg-[#0ac8b9]/20 border-[#0ac8b9]/40 text-[#0ac8b9]" : "bg-white/5 border-white/10 text-[#a09b8c]"
                                            )}>
                                                {m.completed ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#f0e6d2]">{m.title}</div>
                                                <div className="text-[10px] text-[#a09b8c] uppercase font-bold tracking-widest">{m.description}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-[#f0e6d2] font-mono">{m.progress} / {m.target}</div>
                                            <div className="text-[10px] text-[#c8aa6e] font-black">{m.rewardXP} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: REWARD TRACK (SCROLLABLE) */}
                        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 h-[700px] flex flex-col">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.4em] mb-6">
                                <Star size={14} /> Reward Track
                            </h4>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {passTiers.slice(0, 20).map(t => (
                                    <div key={t.level} className={clsx(
                                        "p-4 rounded-xl border flex items-center justify-between transition-all",
                                        t.unlocked ? "bg-[#c8aa6e]/10 border-[#c8aa6e]/40" : "bg-white/5 border-white/5 opacity-50"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-black font-mono text-[#a09b8c] w-6">{t.level}</div>
                                            <div>
                                                <div className="text-xs font-bold text-white">{t.rewardName}</div>
                                                {t.isPremium && <div className="text-[8px] text-[#c8aa6e] font-black uppercase">PREMIUM</div>}
                                            </div>
                                        </div>
                                        {!t.unlocked && <Lock size={14} className="text-[#5c5b57]" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'GUILDS' ? (
                    /* GUILD SECTION */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {userGuild ? (
                            <div className="bg-[#091428]/60 border border-white/10 rounded-3xl p-12 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#c8aa6e] to-[#7a5c29] p-0.5 mb-8 shadow-2xl">
                                    <div className="w-full h-full rounded-[calc(1.5rem-2px)] bg-[#010a13] flex items-center justify-center">
                                        <Shield size={48} className="text-[#c8aa6e]" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-[0.2em] mb-2">{userGuild.name} [{userGuild.tag}]</h3>
                                <p className="text-[#a09b8c] text-sm italic mb-12">"{userGuild.description}"</p>

                                <div className="grid grid-cols-2 gap-6 w-full max-w-sm mb-12">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-[#a09b8c] uppercase font-black mb-1">Level</div>
                                        <div className="text-2xl font-black text-[#c8aa6e] font-mono">{userGuild.level}</div>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-[#a09b8c] uppercase font-black mb-1">Shared Pool</div>
                                        <div className="text-2xl font-black text-[#0ac8b9] font-mono">{userGuild.sharedLibrarySize}</div>
                                    </div>
                                </div>

                                <button className="btn-hextech px-12 py-4">GO TO GUILD ARMORY</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-[#5c5b57] uppercase tracking-[0.4em] mb-4">Elite Alliances Available</h4>
                                {availableGuilds.map(g => (
                                    <div key={g.id} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-[#c8aa6e]/40 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-[#091428] border border-white/10 flex items-center justify-center text-[#c8aa6e]">
                                                <Shield size={32} />
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-[#f0e6d2]">{g.name} [{g.tag}]</div>
                                                <div className="text-xs text-[#a09b8c] mb-2">{g.description}</div>
                                                <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-[#5c5b57]">
                                                    <span className="flex items-center gap-2"><Users size={12} /> {g.memberCount} MEMBERS</span>
                                                    <span className="flex items-center gap-2"><LayoutGrid size={12} /> LVL {g.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => joinGuild(g.id)}
                                            className="btn-hextech-primary px-8 py-3 w-full md:w-auto"
                                        >
                                            Enlist Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* FEATURE PREVIEW */}
                        <div className="hidden lg:flex flex-col justify-center items-center text-center p-12 bg-[#c8aa6e]/5 rounded-3xl border border-[#c8aa6e]/10">
                            <Users className="w-20 h-20 text-[#c8aa6e] mb-8 opacity-20" />
                            <h3 className="text-2xl font-bold mb-4 uppercase tracking-widest text-[#c8aa6e]">Strength in Numbers</h3>
                            <p className="text-[#a09b8c] text-sm leading-relaxed max-w-sm">
                                Guild members enjoy exclusive access to the Shared Armory, enabling you to test physical cards scanned by your allies.
                            </p>
                            <div className="mt-12 flex gap-4">
                                <div className="w-12 h-px bg-gradient-to-l from-[#c8aa6e] to-transparent" />
                                <div className="w-1 h-1 rounded-full bg-[#c8aa6e]" />
                                <div className="w-12 h-px bg-gradient-to-r from-[#c8aa6e] to-transparent" />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SOCIAL SECTION */
                    <div className="h-[600px]">
                        <SocialLobby />
                    </div>
                )}
            </section>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    RETURN TO COMMAND CENTER
                </Link>
            </div>
        </main>
    );
}
