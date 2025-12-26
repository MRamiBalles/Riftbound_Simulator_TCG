import React, { useMemo } from 'react';
import { useGameStore } from '@/store/game-store';

/**
 * Galactic Weather System
 * Renders region-specific visual effects on the game board.
 */
export const WeatherVFX: React.FC = () => {
    const { players } = useGameStore();

    // Determine dominant region (mock logic for now)
    const weatherType = useMemo(() => {
        const regions = ['Freljord', 'Shurima', 'Shadow Isles', 'Void'];
        return regions[Math.floor(Math.random() * regions.length)];
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {weatherType === 'Freljord' && <SnowEffect />}
            {weatherType === 'Shurima' && <SandEffect />}
            {weatherType === 'Shadow Isles' && <MistEffect />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
        </div>
    );
};

const SnowEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="absolute bg-white rounded-full opacity-40 animate-snow"
                style={{
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    animationDelay: `${Math.random() * 5}s`,
                    top: '-10px'
                }}
            />
        ))}
        <style jsx>{`
            @keyframes snow {
                0% { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(110vh) rotate(360deg); }
            }
            .animate-snow { animation: snow linear infinite; }
        `}</style>
    </div>
);

const SandEffect = () => (
    <div className="absolute inset-0">
        <div className="absolute inset-0 bg-yellow-900/10 mix-blend-overlay" />
        {Array.from({ length: 40 }).map((_, i) => (
            <div
                key={i}
                className="absolute bg-yellow-600/30 rounded-full blur-[1px] animate-sand"
                style={{
                    bottom: `${Math.random() * 100}%`,
                    width: `${Math.random() * 10 + 5}px`,
                    height: `1px`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                    animationDelay: `${Math.random() * 2}s`
                }}
            />
        ))}
        <style jsx>{`
            @keyframes sand {
                0% { transform: translateX(-100vw) skewX(-45deg); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: translateX(100vw) skewX(-45deg); opacity: 0; }
            }
            .animate-sand { animation: sand linear infinite; }
        `}</style>
    </div>
);

const MistEffect = () => (
    <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.2)_0%,transparent_70%)] animate-pulse" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-emerald-900/40 to-transparent blur-3xl animate-mist" />
        <style jsx>{`
            @keyframes mist {
                0%, 100% { transform: scale(1) translateY(0); }
                50% { transform: scale(1.1) translateY(-20px); }
            }
            .animate-mist { animation: mist 10s ease-in-out infinite; }
        `}</style>
    </div>
);
