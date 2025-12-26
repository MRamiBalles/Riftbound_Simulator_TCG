import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Sleeve {
    id: string;
    name: string;
    type: 'STATIC' | 'ANIMATED';
    color: string;
}

interface ProfileState {
    activeSleeveId: string;
    unlockedSleeves: string[];
    avatarId: string;

    // Actions
    setSleeve: (id: string) => void;
    unlockSleeve: (id: string) => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            activeSleeveId: 'default',
            unlockedSleeves: ['default', 'void_ripple'],
            avatarId: 'default_master',

            setSleeve: (id) => set({ activeSleeveId: id }),
            unlockSleeve: (id) => set(state => ({
                unlockedSleeves: [...new Set([...state.unlockedSleeves, id])]
            })),
        }),
        {
            name: 'riftbound-profile-storage'
        }
    )
);
