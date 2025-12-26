'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSocialStore, ChatMessage } from '@/store/social-store';
import { Users, Send, MessageSquare, Globe, Shield, Info, UserPlus, X } from 'lucide-react';
import clsx from 'clsx';

export const SocialLobby: React.FC = () => {
    const { friends, messages, sendMessage, addFriend } = useSocialStore();
    const [activeChannel, setActiveChannel] = useState<ChatMessage['type']>('GLOBAL');
    const [inputText, setInputText] = useState('');
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [newFriendName, setNewFriendName] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage(inputText, activeChannel, 'Player_442');
        setInputText('');
    };

    const handleAddFriend = () => {
        if (!newFriendName.trim()) return;
        addFriend(newFriendName);
        setNewFriendName('');
        setShowAddFriend(false);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-4 p-4 lg:p-0">
            {/* Main Chat Area */}
            <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveChannel('GLOBAL')}
                            className={clsx(
                                "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all",
                                activeChannel === 'GLOBAL' ? "text-[#c8aa6e]" : "text-[#5c5b57] hover:text-[#a09b8c]"
                            )}
                        >
                            <Globe size={14} /> Global Chat
                        </button>
                        <button
                            onClick={() => setActiveChannel('GUILD')}
                            className={clsx(
                                "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all",
                                activeChannel === 'GUILD' ? "text-[#c8aa6e]" : "text-[#5c5b57] hover:text-[#a09b8c]"
                            )}
                        >
                            <Shield size={14} /> Guild Net
                        </button>
                    </div>
                    <div className="text-[9px] text-[#5c5b57] font-mono uppercase tracking-widest">
                        Rift Link v1.0.4 // Encrypted
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.filter(m => m.type === activeChannel || m.type === 'SYSTEM').map(m => (
                        <div key={m.id} className={clsx(
                            "group",
                            m.type === 'SYSTEM' ? "bg-white/5 border-white/5 p-3 rounded-lg text-center" : ""
                        )}>
                            {m.type !== 'SYSTEM' && (
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-widest">{m.sender}</span>
                                    <span className="text-[8px] text-[#5c5b57] font-mono">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}
                            <p className={clsx(
                                "text-sm leading-relaxed",
                                m.type === 'SYSTEM' ? "text-[#a09b8c] text-[10px] uppercase font-bold tracking-widest" : "text-[#f0e6d2]"
                            )}>
                                {m.content}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-white/5 flex gap-4">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="TRANSMIT MESSAGE..."
                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold text-[#f0e6d2] focus:outline-none focus:border-[#c8aa6e]/40 transition-all placeholder-[#5c5b57]"
                    />
                    <button
                        onClick={handleSend}
                        className="w-12 h-12 rounded-xl bg-[#c8aa6e] flex items-center justify-center text-black hover:bg-[#f0e6d2] transition-colors shadow-[0_0_20px_rgba(200,170,110,0.2)]"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Friends Sidebar */}
            <div className="w-full lg:w-72 space-y-4">
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col h-full backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em] flex items-center gap-2">
                            <Users size={14} /> Elite Circuit
                        </h4>
                        <button
                            onClick={() => setShowAddFriend(true)}
                            className="text-[#a09b8c] hover:text-[#c8aa6e] transition-all"
                        >
                            <UserPlus size={16} />
                        </button>
                    </div>

                    {showAddFriend && (
                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black uppercase text-[#c8aa6e]">Link User</span>
                                <button onClick={() => setShowAddFriend(false)} className="text-[#5c5b57]"><X size={12} /></button>
                            </div>
                            <input
                                type="text"
                                value={newFriendName}
                                onChange={(e) => setNewFriendName(e.target.value)}
                                placeholder="USERNAME..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white mb-2 focus:outline-none"
                            />
                            <button
                                onClick={handleAddFriend}
                                className="w-full py-2 bg-[#c8aa6e]/20 border border-[#c8aa6e]/40 text-[#c8aa6e] text-[9px] font-black uppercase rounded-lg hover:bg-[#c8aa6e]/40 transition-all"
                            >
                                Send Request
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-4 pt-2">
                        {friends.map(f => (
                            <div key={f.id} className="flex items-center justify-between hover:bg-white/5 p-2 rounded-xl transition-all cursor-default group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-[#091428] border border-white/5 flex items-center justify-center text-[#c8aa6e] text-center font-black text-[10px]">
                                            {f.username[0]}
                                        </div>
                                        <div className={clsx(
                                            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black",
                                            f.status === 'ONLINE' ? "bg-[#0ac8b9]" :
                                                f.status === 'IN_GAME' ? "bg-amber-500 animate-pulse" : "bg-[#5c5b57]"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-[#c8aa6e] transition-colors">{f.username}</div>
                                        <div className="text-[8px] text-[#5c5b57] font-black uppercase tracking-widest">
                                            {f.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                                <MessageSquare size={12} className="text-[#5c5b57] group-hover:text-[#a09b8c] transition-all opacity-0 group-hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
