'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCollectionStore } from '@/store/collection-store';
import { MOCK_CARDS } from '@/services/card-service';
import { Loader2, Camera, Check, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Card as CardComponent } from '@/components/Card';
import clsx from 'clsx';
import Link from 'next/link';

export default function ScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanState, setScanState] = useState<'idle' | 'capturing' | 'analyzing' | 'matching' | 'done'>('idle');
    const [scannedCard, setScannedCard] = useState<any | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const { addCard } = useCollectionStore();

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
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

        setScanState('capturing');
        setScannedCard(null);

        // 1. Capture Frame (Visual flair)
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, 300, 400);
            }
        }

        // 2. Multi-step Simulation
        await new Promise(r => setTimeout(r, 800));
        setScanState('analyzing');

        await new Promise(r => setTimeout(r, 1200));
        setScanState('matching');

        await new Promise(r => setTimeout(r, 1000));

        const randomCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
        setScannedCard(randomCard);
        setHistory(prev => [randomCard, ...prev].slice(0, 5));
        addCard(randomCard.id, 'REAL');
        setScanState('done');
    };

    const reset = () => {
        setScanState('idle');
        setScannedCard(null);
    };

    return (
        <main className="min-h-screen bg-black text-[#f0e6d2] overflow-hidden flex flex-col items-center justify-center relative font-serif">

            {/* --- CAMERA VIEW --- */}
            {!scannedCard ? (
                <>
                    {/* Overlay UI */}
                    <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
                        <header className="flex justify-between items-start">
                            <Link href="/" className="pointer-events-auto bg-black/60 backdrop-blur-md p-2 rounded-full border border-[#c8aa6e] text-[#c8aa6e]">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-[#0ac8b9] text-[#0ac8b9] text-xs font-mono">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ac8b9] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ac8b9]"></span>
                                    </span>
                                    SYSTEM ONLINE
                                </div>
                                <div className="mt-1 text-[10px] text-[#0ac8b9]/70">DB: 850+ Cards</div>
                            </div>
                        </header>
                        {/* Camera Feed */}
                        <div className="relative w-full h-full flex items-center justify-center bg-[#010a13]">
                            {hasPermission === false ? (
                                <div className="text-center p-8 space-y-4">
                                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                                    <h3 className="text-xl font-bold">Camera Access Denied</h3>
                                    <p className="text-gray-400">Please enable camera permissions to scan cards.</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Initializing placeholder */}
                                    {hasPermission === null && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                                            <Loader2 className="w-12 h-12 animate-spin text-[#c8aa6e]" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hextech Reticle Overlay */}
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className={clsx(
                                    "w-64 h-88 border-2 border-[#0ac8b9]/50 rounded-lg relative transition-all duration-300",
                                    scanState !== 'idle' ? "border-[#c8aa6e] shadow-[0_0_50px_rgba(200,170,110,0.5)] scale-95" : "scale-100"
                                )}>
                                    {/* Corners */}
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#0ac8b9]" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#0ac8b9]" />
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#0ac8b9]" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#0ac8b9]" />

                                    {/* Scan Line Animation */}
                                    {scanState === 'idle' && hasPermission && (
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0ac8b9] shadow-[0_0_10px_#0ac8b9] animate-[scan_2s_ease-in-out_infinite]" />
                                    )}

                                    {/* Status Overlay */}
                                    {scanState !== 'idle' && scanState !== 'done' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                            <div className="text-[#c8aa6e] text-xs font-bold tracking-widest uppercase animate-pulse mb-2">
                                                {scanState === 'capturing' && 'Capturing...'}
                                                {scanState === 'analyzing' && 'Analyzing OCR...'}
                                                {scanState === 'matching' && 'Matching DB...'}
                                            </div>
                                            <Loader2 className="w-8 h-8 animate-spin text-[#c8aa6e]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent History (Floating thumbnails) */}
                        {history.length > 0 && scanState === 'idle' && (
                            <div className="absolute bottom-36 inset-x-0 z-20 px-6 flex flex-col items-center">
                                <span className="text-[10px] text-[#a09b8c] uppercase tracking-wider mb-2">Recent Scans</span>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {history.map((card, i) => (
                                        <div key={i} className="w-12 h-16 rounded border border-[#7a5c29] overflow-hidden opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 shadow-lg">
                                            <img src={card.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 inset-x-0 z-20 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center pb-8">
                            <button
                                onClick={handleScan}
                                disabled={!hasPermission || scanState !== 'idle'}
                                className={clsx(
                                    "w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg transition-all",
                                    scanState !== 'idle' ? "border-[#c8aa6e] bg-[#c8aa6e]/20 animate-pulse" : "border-[#f0e6d2] bg-[#f0e6d2]/10 hover:bg-[#f0e6d2]/20 active:scale-95"
                                )}
                            >
                                {scanState !== 'idle' ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-[#c8aa6e]" />
                                ) : (
                                    <Camera className="w-8 h-8 text-[#f0e6d2]" />
                                )}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* --- RESULT VIEW --- */
                <div className="z-10 w-full max-w-md p-6 flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="mb-6 p-4 bg-[#0ac8b9]/10 border border-[#0ac8b9] rounded-full">
                        <Check className="w-12 h-12 text-[#0ac8b9]" />
                    </div>

                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#c8aa6e] to-[#f0e6d2] mb-2 font-serif" style={{ fontFamily: 'Beaufort' }}>
                        IDENTIFIED
                    </h2>
                    <p className="text-[#a09b8c] text-sm uppercase tracking-widest mb-8">
                        Added to Real Collection
                    </p>

                    <div className="mb-8 transform scale-110">
                        <CardComponent card={scannedCard} />
                    </div>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={reset}
                            className="flex-1 btn-hextech-primary flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            SCAN NEXT
                        </button>
                        <Link href="/collection" className="flex-1 btn-hextech text-center flex items-center justify-center">
                            VIEW BINDER
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}
