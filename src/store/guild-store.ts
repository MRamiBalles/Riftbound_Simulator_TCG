import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Guild {
    id: string;
    name: string;
    tag: string;
    description: string;
    memberCount: number;
    level: number;
    xp: number;
    sharedLibrarySize: number;
}

interface GuildState {
    userGuild: Guild | null;
    availableGuilds: Guild[];

    // Actions
    joinGuild: (guildId: string) => void;
    leaveGuild: () => void;
    createGuild: (name: string, tag: string, description: string) => void;
    contributeXP: (val: number) => void;
}

export const useGuildStore = create<GuildState>()(
    persist(
        (set) => ({
            userGuild: null,
            availableGuilds: [
                { id: 'g1', name: 'Nexus Sentinels', tag: 'NXS', description: 'Defenders of the core.', memberCount: 45, level: 12, xp: 4500, sharedLibrarySize: 1240 },
                { id: 'g2', name: 'Shadow Syndicate', tag: 'SHD', description: 'We strike from the dark.', memberCount: 120, level: 25, xp: 12000, sharedLibrarySize: 5600 },
                { id: 'g3', name: 'Rift Walkers', tag: 'RFT', description: 'Exploring the unknown.', memberCount: 22, level: 5, xp: 1200, sharedLibrarySize: 850 },
            ],

            joinGuild: (guildId) => set(state => ({
                userGuild: state.availableGuilds.find(g => g.id === guildId) || null
            })),

            leaveGuild: () => set({ userGuild: null }),

            createGuild: (name, tag, description) => set(state => {
                const newGuild: Guild = {
                    id: `guild-${Date.now()}`,
                    name,
                    tag,
                    description,
                    memberCount: 1,
                    level: 1,
                    xp: 0,
                    sharedLibrarySize: 0
                };
                return {
                    userGuild: newGuild,
                    availableGuilds: [...state.availableGuilds, newGuild]
                };
            }),

            contributeXP: (val) => set(state => {
                if (!state.userGuild) return state;
                const newXP = state.userGuild.xp + val;
                const newLevel = Math.floor(newXP / 1000) + 1;
                return {
                    userGuild: { ...state.userGuild, xp: newXP, level: newLevel }
                };
            })
        }),
        { name: 'riftbound-guild-storage' }
    )
);
