import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuildMember {
    id: string;
    name: string;
    role: 'LEADER' | 'OFFICER' | 'VETERAN' | 'RECRUIT';
    contribution: number;
    joinedAt: number;
}

interface GuildState {
    userGuild: {
        id: string;
        name: string;
        tag: string;
        level: number;
        xp: number;
        motd: string;
        description: string;
        sharedLibrarySize: number;
        members: GuildMember[];
        vault: { shards: number; dust: number };
    } | null;
    availableGuilds: Array<{
        id: string;
        name: string;
        tag: string;
        description: string;
        memberCount: number;
        level: number;
    }>;

    // Actions
    createGuild: (name: string, tag: string) => void;
    joinGuild: (guildId: string) => void;
    leaveGuild: () => void;
    updateMotd: (motd: string) => void;
    contribute: (shards: number, dust: number) => void;
}

export const useGuildStore = create<GuildState>()(
    persist(
        (set, get) => ({
            userGuild: null,
            availableGuilds: [
                { id: 'g1', name: 'VOID WALKERS', tag: 'VOID', description: 'Masters of the rift and beyond.', memberCount: 142, level: 42 },
                { id: 'g2', name: 'SOLAR ECLIPSE', tag: 'SUN', description: 'Harnessing the power of the stars.', memberCount: 88, level: 35 },
                { id: 'g3', name: 'CHRONO KEEPERS', tag: 'TIME', description: 'Guardians of the temporal threads.', memberCount: 215, level: 50 }
            ],

            createGuild: (name, tag) => set({
                userGuild: {
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    tag,
                    level: 1,
                    xp: 0,
                    motd: "Welcome to the Riftbound Alliance!",
                    description: "A new power rises in the rift.",
                    sharedLibrarySize: 0,
                    members: [{ id: 'user_1', name: 'User', role: 'LEADER', contribution: 0, joinedAt: Date.now() }],
                    vault: { shards: 0, dust: 0 }
                }
            }),

            joinGuild: (guildId) => {
                const guild = get().availableGuilds.find((g: any) => g.id === guildId);
                // Mock join logic
                set({
                    userGuild: {
                        id: guildId,
                        name: guild?.name || "DIMENSIONAL OVERLORDS",
                        tag: guild?.tag || "VOID",
                        level: guild?.level || 42,
                        xp: 850000,
                        motd: "FOR THE RIFT!",
                        description: guild?.description || "Masters of the absolute zero.",
                        sharedLibrarySize: 156,
                        members: [
                            { id: 'user_x', name: 'VoidWalker', role: 'LEADER', contribution: 9999, joinedAt: Date.now() },
                            { id: 'user_1', name: 'User', role: 'RECRUIT', contribution: 0, joinedAt: Date.now() }
                        ],
                        vault: { shards: 12500, dust: 50000 }
                    }
                });
            },

            leaveGuild: () => set({ userGuild: null }),

            updateMotd: (motd) => set(state => {
                if (!state.userGuild) return state;
                return { userGuild: { ...state.userGuild, motd } };
            }),

            contribute: (shards, dust) => set(state => {
                if (!state.userGuild) return state;
                const userIndex = state.userGuild.members.findIndex(m => m.name === 'User');
                if (userIndex === -1) return state;

                const newMembers = [...state.userGuild.members];
                newMembers[userIndex].contribution += (shards + (dust * 2));

                return {
                    userGuild: {
                        ...state.userGuild,
                        vault: {
                            shards: state.userGuild.vault.shards + shards,
                            dust: state.userGuild.vault.dust + dust
                        },
                        members: newMembers,
                        xp: state.userGuild.xp + (shards * 10)
                    }
                };
            })
        }),
        {
            name: 'riftbound-guild-storage'
        }
    )
);
