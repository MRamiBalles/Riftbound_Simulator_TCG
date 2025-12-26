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
    missions: Mission[];
    weeklyMissions: Mission[];
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
            missions: [
                { id: 'd1', title: 'Novice Breach', description: 'Open 1 Pack', goal: 1, progress: 0, reward: { type: 'SHARDS', amount: 10 }, completed: false, claimed: false },
                { id: 'd2', title: 'Aggressive Assault', description: 'Deal 5000 damage to Boss', goal: 5000, progress: 0, reward: { type: 'ENERGY', amount: 24 }, completed: false, claimed: false }
            ],
            weeklyMissions: [
                { id: 'w1', title: 'Market Mogul', description: 'Complete 3 Trades', goal: 3, progress: 0, reward: { type: 'DUST', amount: 500 }, completed: false, claimed: false }
            ],
            dailyClaimed: false,
            lastLogin: null,

            updateProgress: (id, amount) => set(state => {
                const update = (m: Mission) => {
                    if (m.id !== id || m.completed) return m;
                    const next = m.progress + amount;
                    return { ...m, progress: next, completed: next >= m.goal };
                };
                return {
                    missions: state.missions.map(update),
                    weeklyMissions: state.weeklyMissions.map(update)
                };
            }),

            claimReward: (id) => set(state => {
                const claim = (m: Mission) => (m.id === id ? { ...m, claimed: true } : m);
                return {
                    missions: state.missions.map(claim),
                    weeklyMissions: state.weeklyMissions.map(claim)
                };
            }),

            refreshDaily: () => set({
                missions: [
                    { id: 'd1', title: 'Novice Breach', description: 'Open 1 Pack', goal: 1, progress: 0, reward: { type: 'SHARDS', amount: 10 }, completed: false, claimed: false },
                    { id: 'd2', title: 'Aggressive Assault', description: 'Deal 5000 damage to Boss', goal: 5000, progress: 0, reward: { type: 'ENERGY', amount: 24 }, completed: false, claimed: false }
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
