import React, { useEffect, useState } from 'react';
import { useMissionStore } from '@/store/mission-store';
import { Gift, CheckCircle, Target } from 'lucide-react';
import clsx from 'clsx';

export default function MissionWidget() {
    const { missions } = useMissionStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full max-w-md mx-auto mb-8 space-y-4">
            {/* Mission List */}
            <div className="bg-[#010a13]/50 border border-[#7a5c29]/30 rounded-xl p-6 space-y-4 backdrop-blur-md">
                <h3 className="text-[#c8aa6e] text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Live Objectives
                </h3>

                {missions.map(mission => (
                    <div key={mission.id} className="space-y-2">
                        <div className="flex justify-between text-xs text-[#f0e6d2] uppercase font-bold tracking-widest">
                            <span>{mission.description}</span>
                            <span className={mission.completed ? "text-[#0ac8b9]" : "text-[#a09b8c]"}>
                                {mission.progress}/{mission.goal}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={clsx(
                                    "h-full transition-all duration-700",
                                    mission.completed ? "bg-[#0ac8b9] shadow-[0_0_10px_rgba(10,200,185,0.5)]" : "bg-[#c8aa6e]"
                                )}
                                style={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
