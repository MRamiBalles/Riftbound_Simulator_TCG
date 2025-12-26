'use client';

import { useUserStore } from '@/store/user-store';
import { Zap, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function EnergyWidget() {
    const { getRefreshedEnergy, boosterEnergy, lastEnergyUpdate } = useUserStore();
    const currentEnergy = getRefreshedEnergy();
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Update timer every second
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentEnergy < 24) {
                const now = Date.now();
                const nextPoint = lastEnergyUpdate + 3600000;
                const diff = nextPoint - now;

                if (diff > 0) {
                    const minutes = Math.floor(diff / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
                } else {
                    setTimeLeft('Refreshing...');
                }
            } else {
                setTimeLeft('');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentEnergy, lastEnergyUpdate]);

    return (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end">
            {/* Main Energy Badge */}
            <div className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all",
                currentEnergy > 0
                    ? "bg-[#091428]/90 border-[#0ac8b9] shadow-[0_0_10px_rgba(10,200,185,0.4)]"
                    : "bg-gray-900/90 border-gray-600 grayscale"
            )}>
                <Zap className={clsx(
                    "w-5 h-5 fill-current",
                    currentEnergy > 0 ? "text-[#0ac8b9]" : "text-gray-500"
                )} />
                <span className="font-bold text-lg text-[#f0e6d2]" style={{ fontFamily: 'Beaufort' }}>
                    {currentEnergy} / 24
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
