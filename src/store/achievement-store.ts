import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    reward: { type: 'SHARDS' | 'ENERGY' | 'BADGE'; amount: number; badgeId?: string };
    claimed: boolean;
    category: 'COLLECTION' | 'PULLS' | 'SOCIAL';
}

interface AchieveState {
    achievements: Achievement[];
    updateProgress: (category: Achievement['category'], amount?: number) => void;
    claimReward: (id: string) => boolean;
}

export const useAchieveStore = create<AchieveState>()(
    persist(
        (set, get) => ({
            achievements: [
                // COLLECTION
                { id: 'coll1', title: 'Rookie Collector', description: 'Own 10 unique cards', target: 10, current: 0, reward: { type: 'SHARDS', amount: 5 }, claimed: false, category: 'COLLECTION' },
                { id: 'coll2', title: 'Set Finisher', description: 'Complete any region set', target: 1, current: 0, reward: { type: 'BADGE', amount: 0, badgeId: 'badge_completionist' }, claimed: false, category: 'COLLECTION' },
                // PULLS
                { id: 'pull1', title: 'First Sparkle', description: 'Pull your first Legendary', target: 1, current: 0, reward: { type: 'SHARDS', amount: 10 }, claimed: false, category: 'PULLS' },
                { id: 'pull2', title: 'God Puller', description: 'Open a God Pack (2+ hits)', target: 1, current: 0, reward: { type: 'ENERGY', amount: 24 }, claimed: false, category: 'PULLS' },
                // SOCIAL
                { id: 'soc1', title: 'Social Butterfly', description: 'Perform 5 Wonder Picks', target: 5, current: 0, reward: { type: 'SHARDS', amount: 5 }, claimed: false, category: 'SOCIAL' }
            ],

            updateProgress: (category, amount = 1) => set(state => ({
                achievements: state.achievements.map(a =>
                    a.category === category && !a.claimed ? { ...a, current: Math.min(a.target, a.current + amount) } : a
                )
            })),

            claimReward: (id) => {
                const achievement = get().achievements.find(a => a.id === id);
                if (achievement && achievement.current >= achievement.target && !achievement.claimed) {
                    set(state => ({
                        achievements: state.achievements.map(a => a.id === id ? { ...a, claimed: true } : a)
                    }));
                    // Actual reward granting would happen here (import useUserStore)
                    return true;
                }
                return false;
            }
        }),
        {
            name: 'riftbound-achievements'
        }
    )
);
