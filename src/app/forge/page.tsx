'use client';

import React, { useState } from 'react';
import { ForgeService, ForgedCard } from '@/services/forge-service';
import { HextechNavbar } from '@/components/layout/HextechNavbar';
import { HextechSidebar } from '@/components/layout/HextechSidebar';
import { RealityLinkService } from '@/services/reality-link-service';
import { Sparkles, Brain, Cpu, Save, RefreshCw, Zap, Shield, Wand2, FileText, Check } from 'lucide-react';
import { Card as CardComponent } from '@/components/Card';
import Link from 'next/link';
import clsx from 'clsx';

export default function ForgePage() {
    const [prompt, setPrompt] = useState('');
    const [isForging, setIsForging] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportUrl, setExportUrl] = useState<string | null>(null);
    const [result, setResult] = useState<ForgedCard | null>(null);

    const handleForge = async () => {
        if (!prompt.trim() || isForging) return;
        setIsForging(true);
        setExportUrl(null);
        try {
            const card = await ForgeService.forge(prompt);
            setResult(card);
        } finally {
            setIsForging(false);
        }
    };

    const handleExport = async () => {
        if (!result || isExporting) return;
        setIsExporting(true);
        try {
            const url = await RealityLinkService.exportToPDF(result);
            setExportUrl(url);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#010a13] text-[#f0e6d2] font-serif pt-24 pb-24 px-4">
            <HextechNavbar />
            <HextechSidebar />

            <div className="max-w-6xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] via-[#f0e6d2] to-[#c8aa6e] uppercase mb-4" style={{ fontFamily: 'Beaufort' }}>
                        Neural Forge
                    </h1>
                    <p className="text-[10px] text-[#a09b8c] font-black uppercase tracking-[0.5em]">Transcendent Generative Synthesis</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* INPUT SECTION */}
                    <div className="space-y-8">
                        <div className="bg-[#091428]/60 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#c8aa6e]/10 rounded-full blur-[80px]" />

                            <div className="relative z-10">
                                <label className="text-[10px] font-black text-[#c8aa6e] uppercase tracking-[0.3em] mb-4 block">Neural Directive</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your creation... (e.g., 'A dragon composed of living lightning from Ionia')"
                                    className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-bold text-white focus:outline-none focus:border-[#c8aa6e]/40 transition-all placeholder-[#5c5b57] resize-none mb-6"
                                />
                                <button
                                    onClick={handleForge}
                                    disabled={isForging || !prompt.trim()}
                                    className={clsx(
                                        "w-full btn-hextech-primary py-5 text-lg flex items-center justify-center gap-3 transition-opacity",
                                        (isForging || !prompt.trim()) && "opacity-50"
                                    )}
                                >
                                    {isForging ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={20} />
                                            Synthesizing Essence...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={20} />
                                            Ignite the Forge
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
                            <Brain className="text-[#c8aa6e] shrink-0" size={20} />
                            <div>
                                <h4 className="text-[10px] font-black text-[#f0e6d2] uppercase tracking-widest mb-1">AI Balance Protocol</h4>
                                <p className="text-[10px] text-[#a09b8c] leading-relaxed">The Forge automatically calculates Fair-Play statistics based on your description. Forged cards are legal in Custom Lobbies only.</p>
                            </div>
                        </div>
                    </div>

                    {/* PREVIEW SECTION */}
                    <div className="flex flex-col items-center">
                        {result ? (
                            <div className="animate-in zoom-in fade-in duration-1000 flex flex-col items-center">
                                <div className="mb-12 perspective-1000">
                                    <div className="shadow-[0_0_100px_rgba(200,170,110,0.2)] rounded-[2rem] overflow-hidden transform rotate-y-12">
                                        <CardComponent card={result} />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting || !!exportUrl}
                                        className={clsx(
                                            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                            exportUrl ? "bg-[#0ac8b9]/20 border border-[#0ac8b9]/40 text-[#0ac8b9]" : "bg-[#c8aa6e]/10 border border-[#c8aa6e]/40 text-[#c8aa6e] hover:bg-[#c8aa6e]/20"
                                        )}
                                    >
                                        {isExporting ? <RefreshCw className="animate-spin" size={14} /> : exportUrl ? <Check size={14} /> : <FileText size={14} />}
                                        {isExporting ? 'EXPORING PDF...' : exportUrl ? 'DOC READY' : 'EXPORT HIGH-RES PDF'}
                                    </button>
                                    <button className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Save Blueprint
                                    </button>
                                </div>
                                {exportUrl && (
                                    <p className="mt-4 text-[9px] text-[#0ac8b9] font-black uppercase tracking-widest animate-pulse">
                                        LINK GENERATED: <a href={exportUrl} target="_blank" className="underline">DOWNLOAD ASSET</a>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="w-80 h-[480px] rounded-[2rem] border-2 border-dashed border-[#5c5b57]/30 flex flex-col items-center justify-center text-[#5c5b57] relative">
                                <Sparkles size={64} className="mb-4 opacity-10" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Genesis</span>

                                <div className="absolute inset-0 bg-gradient-to-t from-[#c8aa6e]/5 to-transparent rounded-[2rem]" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-24 text-center">
                <Link href="/" className="text-[#a09b8c] hover:text-[#c8aa6e] transition-colors text-[10px] uppercase font-black border-b border-transparent hover:border-[#c8aa6e] pb-1 tracking-[0.4em]">
                    RETURN TO NEXUS
                </Link>
            </div>
        </main>
    );
}
