'use client';

import { useEnergyStore } from '@/store/energy-store';
import { Zap, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function EnergyWidget() {
    const { energy, maxEnergy, nextRegenTime, checkRegen } = useEnergyStore();
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Check for regen every second and update timer
    useEffect(() => {
        const interval = setInterval(() => {
            checkRegen(); // Logic check

            if (nextRegenTime && energy < maxEnergy) {
                const now = Date.now();
                const diff = nextRegenTime - now;
                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                } else {
                    setTimeLeft('');
                }
            } else {
                setTimeLeft('');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [nextRegenTime, energy, maxEnergy, checkRegen]);

    return (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end">
            {/* Main Energy Badge */}
            <div className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all",
                energy > 0
                    ? "bg-[#091428]/90 border-[#0ac8b9] shadow-[0_0_10px_rgba(10,200,185,0.4)]"
                    : "bg-gray-900/90 border-gray-600 grayscale"
            )}>
                <Zap className={clsx(
                    "w-5 h-5 fill-current",
                    energy > 0 ? "text-[#0ac8b9]" : "text-gray-500"
                )} />
                <span className="font-bold text-lg text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>
                    {energy} / {maxEnergy}
                </span>
            </div>

            {/* Timer Sub-badge */}
            {timeLeft && (
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-[#c8aa6e] bg-black/60 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}</span>
                </div>
            )}
        </div>
    );
}
