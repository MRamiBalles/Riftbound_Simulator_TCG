'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { useUserStore } from '@/store/user-store';
import { VisionService, VisionResult } from '@/services/vision-service';
import { Loader2, Camera, Check, AlertCircle, RefreshCw, ArrowLeft, Zap, PlayCircle, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Card as CardComponent } from '@/components/Card';
import clsx from 'clsx';
import Link from 'next/link';

export default function ScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanState, setScanState] = useState<'idle' | 'capturing' | 'analyzing' | 'matching' | 'done'>('idle');
    const [scannedResult, setScannedResult] = useState<VisionResult | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isWatchingAd, setIsWatchingAd] = useState(false);

    const { addCard } = useCollectionStore();
    const { scanCredits, isPremium, useScanCredit, watchAd, upgradeToPremium } = useUserStore();

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasPermission(true);
            }
        } catch (err) {
            console.error("Camera Error:", err);
            setHasPermission(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleScan = async () => {
        if (scanState !== 'idle') return;

        // Quota Check
        if (!useScanCredit()) {
            return; // UI will handle the overlay
        }

        setScanState('capturing');
        setScannedResult(null);

        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, 300, 400);
            }
        }

        await new Promise(r => setTimeout(r, 600));
        setScanState('analyzing');

        // Advanced AI Recognition
        const result = await VisionService.recognize();

        setScanState('matching');
        await new Promise(r => setTimeout(r, 800));

        setScannedResult(result);
        setHistory(prev => [result.card, ...prev].slice(0, 5));
        addCard(result.card.id, 'REAL');
        setScanState('done');
    };

    const handleWatchAd = async () => {
        setIsWatchingAd(true);
        await watchAd();
        setIsWatchingAd(false);
    };

    const reset = () => {
        setScanState('idle');
        setScannedResult(null);
    };

    return (
        <main className="min-h-screen bg-black text-[#f0e6d2] overflow-hidden flex flex-col items-center justify-center relative font-serif">

            {/* --- CAMERA VIEW --- */}
            {!scannedResult ? (
                <>
                    <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
                        <header className="flex justify-between items-start">
                            <Link href="/" className="pointer-events-auto bg-black/60 backdrop-blur-md p-2 rounded-full border border-[#c8aa6e] text-[#c8aa6e]">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>

                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-[#0ac8b9] text-[#0ac8b9] text-xs font-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ac8b9] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ac8b9]"></span>
                                        </span>
                                        SYSTEM ONLINE
                                    </div>
                                </div>

                                <div className={clsx(
                                    "px-3 py-1.5 rounded-full border text-[10px] font-bold flex items-center gap-2 backdrop-blur-md",
                                    isPremium ? "border-[#c8aa6e] text-[#c8aa6e] bg-[#c8aa6e]/10" : "border-white/20 text-white bg-white/5"
                                )}>
                                    <Zap className="w-3 h-3" />
                                    {isPremium ? "PREMIUM (∞)" : `${scanCredits} SCANS LEFT`}
                                </div>
                            </div>
                        </header>

                        <div className="relative w-full h-full flex items-center justify-center bg-[#010a13]">
                            {hasPermission === false ? (
                                <div className="text-center p-8 space-y-4">
                                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                                    <h3 className="text-xl font-bold">Camera Access Denied</h3>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {hasPermission === null && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                                            <Loader2 className="w-12 h-12 animate-spin text-[#c8aa6e]" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className={clsx(
                                    "w-64 h-88 border-2 border-[#0ac8b9]/50 rounded-lg relative transition-all duration-300",
                                    scanState !== 'idle' ? "border-[#c8aa6e] shadow-[0_0_50px_rgba(200,170,110,0.5)] scale-95" : "scale-100"
                                )}>
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#0ac8b9]" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#0ac8b9]" />
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#0ac8b9]" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#0ac8b9]" />

                                    {scanState === 'idle' && hasPermission && (
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0ac8b9] shadow-[0_0_10px_#0ac8b9] animate-[scan_2s_ease-in-out_infinite]" />
                                    )}

                                    {scanState !== 'idle' && scanState !== 'done' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                            <div className="text-[#c8aa6e] text-xs font-bold tracking-widest uppercase animate-pulse mb-2">
                                                {scanState.toUpperCase()}...
                                            </div>
                                            <Loader2 className="w-8 h-8 animate-spin text-[#c8aa6e]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 z-20 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center pb-8">
                            <button
                                onClick={handleScan}
                                disabled={!hasPermission || scanState !== 'idle'}
                                className={clsx(
                                    "w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg transition-all",
                                    scanState !== 'idle' ? "border-[#c8aa6e] bg-[#c8aa6e]/20 animate-pulse" : "border-[#f0e6d2] bg-[#f0e6d2]/10 hover:bg-[#f0e6d2]/20 active:scale-95"
                                )}
                            >
                                {scanState !== 'idle' ? <Loader2 className="w-8 h-8 animate-spin text-[#c8aa6e]" /> : <Camera className="w-8 h-8 text-[#f0e6d2]" />}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* --- RESULT VIEW --- */
                <div className="z-10 w-full max-w-md p-6 flex flex-col items-center animate-in zoom-in duration-300 pt-20">
                    <div className="absolute top-10 flex gap-4">
                        <div className="bg-[#0ac8b9]/20 border border-[#0ac8b9]/40 rounded-full px-4 py-1 text-[10px] font-black text-[#0ac8b9] uppercase letter-spacing-widest">
                            AI CONFIDENCE: {(scannedResult.confidence * 100).toFixed(1)}%
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-[#0ac8b9]/10 border border-[#0ac8b9] rounded-full">
                        <Check className="w-12 h-12 text-[#0ac8b9]" />
                    </div>

                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] to-[#f0e6d2] mb-2 font-serif text-center" style={{ fontFamily: 'Beaufort' }}>
                        {scannedResult.card.name}
                    </h2>

                    <div className="flex flex-wrap justify-center gap-1 mb-6">
                        {scannedResult.detectedFeatures.map((f, i) => (
                            <span key={i} className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[#a09b8c] uppercase font-bold">
                                {f}
                            </span>
                        ))}
                    </div>

                    <div className="mb-8 transform scale-90">
                        <CardComponent card={scannedResult.card} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mb-4">
                        <button className="btn-hextech flex items-center justify-center gap-2 text-[10px] py-3 opacity-60 hover:opacity-100">
                            <ShoppingCart className="w-4 h-4" /> BUY ON MARKET
                        </button>
                        <button className="btn-hextech flex items-center justify-center gap-2 text-[10px] py-3 opacity-60 hover:opacity-100">
                            <ExternalLink className="w-4 h-4" /> SELL THIS CARD
                        </button>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button onClick={reset} className="flex-1 btn-hextech-primary flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" /> NEXT CARD
                        </button>
                        <Link href="/collection" className="flex-1 btn-hextech text-center flex items-center justify-center">
                            BACK TO BINDER
                        </Link>
                    </div>
                </div>
            )}

            {/* --- QUOTA DEPLETED OVERLAY --- */}
            {scanCredits === 0 && !isPremium && scanState === 'idle' && !scannedResult && (
                <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-8">
                        <Zap className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#f0e6d2] mb-4" style={{ fontFamily: 'Beaufort' }}>Energy Depleted</h2>
                    <p className="text-[#a09b8c] text-sm mb-12 max-w-xs">
                        Refill your neuro-link to continue scanning physical cards into your vault.
                    </p>

                    <div className="space-y-4 w-full max-w-xs pointer-events-auto">
                        <button
                            onClick={handleWatchAd}
                            disabled={isWatchingAd}
                            className="w-full btn-hextech-primary flex items-center justify-center gap-3 py-4"
                        >
                            {isWatchingAd ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                            {isWatchingAd ? 'TRANSMITTING...' : 'WATCH AD (+10 SCANS)'}
                        </button>

                        <button
                            onClick={upgradeToPremium}
                            className="w-full btn-hextech flex items-center justify-center gap-3 py-4 border-[#c8aa6e]"
                        >
                            <Star className="w-5 h-5 text-[#c8aa6e]" />
                            GO PREMIUM (UNLIMITED)
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} width={300} height={400} className="hidden" />
        </main>
    );
}
