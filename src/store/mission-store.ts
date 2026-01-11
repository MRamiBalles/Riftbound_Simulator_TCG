import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mission {
    id: string;
    title: string;
    description: string;
    goal: number;
    progress: number;
    reward: { type: 'SHARDS' | 'ENERGY' | 'DUST', amount: number };
    completed: boolean;
    claimed: boolean;
}

interface MissionState {
    activeMissions: Array<Mission & { target: number; rewardXP: number }>;
    level: number;
    currentXP: number;
    requiredXP: number;
    passTiers: Array<{ level: number; rewardName: string; isPremium: boolean; unlocked: boolean }>;
    dailyClaimed: boolean;
    lastLogin: number | null;

    // Actions
    updateProgress: (id: string, amount: number) => void;
    claimReward: (id: string) => void;
    refreshDaily: () => void;
    checkDailyLogin: () => void;
    claimDaily: () => number;
}

export const useMissionStore = create<MissionState>()(
    persist(
        (set, get) => ({
            activeMissions: [
                { id: 'd1', title: 'Novice Breach', description: 'Open 1 Pack', goal: 1, progress: 0, target: 1, rewardXP: 150, reward: { type: 'SHARDS', amount: 10 }, completed: false, claimed: false },
                { id: 'd2', title: 'Aggressive Assault', description: 'Deal 5000 damage to Boss', goal: 5000, progress: 1250, target: 5000, rewardXP: 450, reward: { type: 'ENERGY', amount: 24 }, completed: false, claimed: false }
            ],
            level: 14,
            currentXP: 1250,
            requiredXP: 2000,
            passTiers: Array.from({ length: 50 }, (_, i) => ({
                level: i + 1,
                rewardName: i % 5 === 0 ? 'Legendary Core' : '100 Shards',
                isPremium: i % 3 === 0,
                unlocked: i + 1 <= 14
            })),
            dailyClaimed: false,
            lastLogin: null,

            updateProgress: (id, amount) => set(state => {
                const update = (m: any) => {
                    if (m.id !== id || m.completed) return m;
                    const next = m.progress + amount;
                    return { ...m, progress: next, completed: next >= m.goal };
                };
                return {
                    activeMissions: state.activeMissions.map(update)
                };
            }),

            claimReward: (id) => set(state => {
                const claim = (m: any) => (m.id === id ? { ...m, claimed: true } : m);
                return {
                    activeMissions: state.activeMissions.map(claim)
                };
            }),

            refreshDaily: () => set({
                activeMissions: [
                    { id: 'd1', title: 'Novice Breach', description: 'Open 1 Pack', goal: 1, progress: 0, target: 1, rewardXP: 150, reward: { type: 'SHARDS', amount: 10 }, completed: false, claimed: false },
                    { id: 'd2', title: 'Aggressive Assault', description: 'Deal 5000 damage to Boss', goal: 5000, progress: 0, target: 5000, rewardXP: 450, reward: { type: 'ENERGY', amount: 24 }, completed: false, claimed: false }
                ]
            }),

            checkDailyLogin: () => {
                const { lastLogin } = get();
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;

                if (!lastLogin || (now - lastLogin) > oneDay) {
                    set({ dailyClaimed: false, lastLogin: now });
                }
            },

            claimDaily: () => {
                const { dailyClaimed } = get();
                if (dailyClaimed) return 0;
                set({ dailyClaimed: true });
                return 100; // Reward 100 Hex Cores (Virtual Shards)
            }
        }),
        {
            name: 'riftbound-mission-storage'
        }
    )
);
