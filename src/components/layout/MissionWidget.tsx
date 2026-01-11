'use client';

import React, { useEffect, useState } from 'react';
import { useMissionStore } from '@/store/mission-store';
import { Gift, CheckCircle, Target } from 'lucide-react';
import clsx from 'clsx';

export default function MissionWidget() {
    const { missions, dailyClaimed, checkDailyLogin, claimDaily } = useMissionStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkDailyLogin();
    }, [checkDailyLogin]);

    if (!mounted) return null;

    const handleClaimDaily = () => {
        const reward = claimDaily();
        if (reward > 0) {
            // Simple alert or visual feedback instead of confetti
            alert(`Claimed ${reward} Hex Cores!`);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mb-8 space-y-4">
            {/* Daily Login Bonus */}
            <div className={clsx(
                "relative p-4 rounded-xl border flex items-center justify-between transition-all bg-[#091428]/50 border-[#7a5c29]/30 text-[#a09b8c]"
            )}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-[#7a5c29]/20">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider">
                            Daily Activity
                        </h3>
                        <p className="text-xs text-[#a09b8c]">Earn prestige through gameplay</p>
                    </div>
                </div>
                <CheckCircle className="w-6 h-6 text-[#7a5c29]" />
            </div>

            {/* Mission List */}
            <div className="bg-[#010a13]/50 border border-[#7a5c29]/30 rounded-xl p-4 space-y-3">
                <h3 className="text-[#c8aa6e] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Daily Missions
                </h3>

                {missions.map(mission => (
                    <div key={mission.id} className="space-y-1">
                        <div className="flex justify-between text-xs text-[#f0e6d2]">
                            <span>{mission.description}</span>
                            <span className={mission.completed ? "text-[#0ac8b9]" : "text-[#a09b8c]"}>
                                {mission.progress}/{mission.goal}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1e2328] rounded-full overflow-hidden">
                            <div
                                className={clsx(
                                    "h-full transition-all duration-500",
                                    mission.completed ? "bg-[#0ac8b9]" : "bg-[#c8aa6e]"
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
