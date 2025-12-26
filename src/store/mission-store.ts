import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mission {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    rewardXP: number;
    completed: boolean;
}

export interface PassTier {
    level: number;
    rewardName: string;
    isPremium: boolean;
    unlocked: boolean;
}

interface MissionState {
    level: number;
    currentXP: number;
    requiredXP: number;
    activeMissions: Mission[];
    passTiers: PassTier[];

    // Actions
    updateMissionProgress: (id: string, val: number) => void;
    claimTierReward: (level: number) => void;
}

export const useMissionStore = create<MissionState>()(
    persist(
        (set) => ({
            level: 1,
            currentXP: 250,
            requiredXP: 1000,
            activeMissions: [
                { id: 'm1', title: 'Tactical Superiority', description: 'Win 3 games against AI Hard.', progress: 1, target: 3, rewardXP: 500, completed: false },
                { id: 'm2', title: 'Rift Explorer', description: 'Scan 5 new physical cards.', progress: 2, target: 5, rewardXP: 300, completed: false },
                { id: 'm3', title: 'Market regular', description: 'Buy or Sell 1 card in the Bazaar.', progress: 0, target: 1, rewardXP: 200, completed: false },
            ],
            passTiers: Array.from({ length: 50 }, (_, i) => ({
                level: i + 1,
                rewardName: i % 5 === 0 ? 'Foil Shard' : '50 Scraps',
                isPremium: i % 10 === 0,
                unlocked: i < 1
            })),

            updateMissionProgress: (id, val) => set(state => {
                const updatedMissions = state.activeMissions.map(m => {
                    if (m.id === id) {
                        const newProgress = Math.min(m.progress + val, m.target);
                        const completed = newProgress >= m.target;
                        return { ...m, progress: newProgress, completed };
                    }
                    return m;
                });

                // Calculate added XP
                const mission = updatedMissions.find(m => m.id === id);
                let addedXP = 0;
                if (mission?.completed && !state.activeMissions.find(m => m.id === id)?.completed) {
                    addedXP = mission.rewardXP;
                }

                let newXP = state.currentXP + addedXP;
                let newLevel = state.level;
                while (newXP >= state.requiredXP) {
                    newXP -= state.requiredXP;
                    newLevel++;
                }

                return {
                    activeMissions: updatedMissions,
                    currentXP: newXP,
                    level: newLevel,
                    passTiers: state.passTiers.map(t => ({
                        ...t,
                        unlocked: t.level <= newLevel
                    }))
                };
            }),

            claimTierReward: (level) => set(state => ({
                passTiers: state.passTiers.map(t => t.level === level ? { ...t, unlocked: true } : t)
            }))
        }),
        { name: 'riftbound-mission-storage' }
    )
);
