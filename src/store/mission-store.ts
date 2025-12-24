import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mission {
    id: string;
    description: string;
    goal: number;
    progress: number;
    completed: boolean;
    reward: number;
}

interface MissionState {
    lastLoginDate: string;
    dailyClaimed: boolean;
    missions: Mission[];

    // Actions
    checkDailyLogin: () => void;
    claimDaily: () => number; // Returns reward amount
    updateMission: (id: string, amount: number) => void;
    completeMission: (id: string) => number; // Returns reward amount
}

export const useMissionStore = create<MissionState>()(
    persist(
        (set, get) => ({
            lastLoginDate: '',
            dailyClaimed: false,
            missions: [
                { id: 'm1', description: 'Open 2 Booster Packs', goal: 2, progress: 0, completed: false, reward: 50 },
                { id: 'm2', description: 'Trade a Card', goal: 1, progress: 0, completed: false, reward: 100 },
                { id: 'm3', description: 'Scan a Physical Card', goal: 1, progress: 0, completed: false, reward: 200 },
            ],

            checkDailyLogin: () => {
                const today = new Date().toISOString().split('T')[0];
                const { lastLoginDate } = get();

                if (lastLoginDate !== today) {
                    // Reset Logic
                    set({
                        lastLoginDate: today,
                        dailyClaimed: false,
                        missions: get().missions.map(m => ({ ...m, progress: 0, completed: false }))
                    });
                }
            },

            claimDaily: () => {
                const { dailyClaimed } = get();
                if (dailyClaimed) return 0;
                set({ dailyClaimed: true });
                return 100; // 100 Cores Login Bonus
            },

            updateMission: (id, amount) => {
                set(state => ({
                    missions: state.missions.map(m => {
                        if (m.id !== id || m.completed) return m;
                        const newProgress = Math.min(m.progress + amount, m.goal);
                        return { ...m, progress: newProgress, completed: newProgress >= m.goal }; // Auto complete logic handling could be separate but simple here
                    })
                }));
            },

            completeMission: (id) => {
                // Just defined designed to be called when claiming, for now we auto-complete in update?
                // Let's simplified: Claiming is automatic on update for this MVP or manual?
                // Visual feedback is better if manual claim.
                // For MVP, let's auto-complete state but require "Click to Claim" in UI?
                // Keep it simple: Auto-complete state, UI shows "Claim" button if completed && !claimed.
                // Refactoring: Add 'claimed' field to mission? 
                // Let's stick to simple: Auto-complete = reward instantly? No, user misses the dopamine.
                return 0;
            }
        }),
        {
            name: 'riftbound-missions-storage',
        }
    )
);
