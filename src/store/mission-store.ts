import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mission {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    reward: { type: 'SHARDS' | 'ENERGY' | 'DUST', amount: number };
    completed: boolean;
    claimed: boolean;
}

interface MissionState {
    dailyMissions: Mission[];
    weeklyMissions: Mission[];

    // Actions
    updateProgress: (id: string, amount: number) => void;
    claimReward: (id: string) => void;
    refreshDaily: () => void;
}

export const useMissionStore = create<MissionState>()(
    persist(
        (set) => ({
            dailyMissions: [
                { id: 'd1', title: 'Novice Breach', description: 'Open 1 Pack', target: 1, current: 0, reward: { type: 'SHARDS', amount: 10 }, completed: false, claimed: false },
                { id: 'd2', title: 'Aggressive Assault', description: 'Deal 5000 damage to Boss', target: 5000, current: 0, reward: { type: 'ENERGY', amount: 24 }, completed: false, claimed: false }
            ],
            weeklyMissions: [
                { id: 'w1', title: 'Market Mogul', description: 'Complete 3 Trades', target: 3, current: 0, reward: { type: 'DUST', amount: 500 }, completed: false, claimed: false }
            ],

            updateProgress: (id, amount) => set(state => {
                const update = (m: Mission) => {
                    if (m.id !== id || m.completed) return m;
                    const next = m.current + amount;
                    return { ...m, current: next, completed: next >= m.target };
                };
                return {
                    dailyMissions: state.dailyMissions.map(update),
                    weeklyMissions: state.weeklyMissions.map(update)
                };
            }),

            claimReward: (id) => set(state => {
                const claim = (m: Mission) => (m.id === id ? { ...m, claimed: true } : m);
                return {
                    dailyMissions: state.dailyMissions.map(claim),
                    weeklyMissions: state.weeklyMissions.map(claim)
                };
            }),

            refreshDaily: () => set({
                dailyMissions: [
                    { id: 'd1', title: 'Novice Breach', description: 'Open 1 Pack', target: 1, current: 0, reward: { type: 'SHARDS', amount: 10 }, completed: false, claimed: false },
                    { id: 'd2', title: 'Aggressive Assault', description: 'Deal 5000 damage to Boss', target: 5000, current: 0, reward: { type: 'ENERGY', amount: 24 }, completed: false, claimed: false }
                ]
            })
        }),
        {
            name: 'riftbound-mission-storage'
        }
    )
);
