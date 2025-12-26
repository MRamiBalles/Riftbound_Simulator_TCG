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
    guild: {
        id: string;
        name: string;
        tag: string;
        level: number;
        xp: number;
        motd: string;
        members: GuildMember[];
        vault: { shards: number; dust: number };
    } | null;

    // Actions
    createGuild: (name: string, tag: string) => void;
    joinGuild: (guildId: string) => void;
    leaveGuild: () => void;
    updateMotd: (motd: string) => void;
    contribute: (shards: number, dust: number) => void;
}

export const useGuildStore = create<GuildState>()(
    persist(
        (set) => ({
            guild: null,

            createGuild: (name, tag) => set({
                guild: {
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    tag,
                    level: 1,
                    xp: 0,
                    motd: "Welcome to the Riftbound Alliance!",
                    members: [{ id: 'user_1', name: 'User', role: 'LEADER', contribution: 0, joinedAt: Date.now() }],
                    vault: { shards: 0, dust: 0 }
                }
            }),

            joinGuild: (guildId) => {
                // Mock join logic
                set({
                    guild: {
                        id: guildId,
                        name: "DIMENSIONAL OVERLORDS",
                        tag: "VOID",
                        level: 42,
                        xp: 850000,
                        motd: "FOR THE RIFT!",
                        members: [
                            { id: 'user_x', name: 'VoidWalker', role: 'LEADER', contribution: 9999, joinedAt: Date.now() },
                            { id: 'user_1', name: 'User', role: 'RECRUIT', contribution: 0, joinedAt: Date.now() }
                        ],
                        vault: { shards: 12500, dust: 50000 }
                    }
                });
            },

            leaveGuild: () => set({ guild: null }),

            updateMotd: (motd) => set(state => {
                if (!state.guild) return state;
                return { guild: { ...state.guild, motd } };
            }),

            contribute: (shards, dust) => set(state => {
                if (!state.guild) return state;
                const userIndex = state.guild.members.findIndex(m => m.name === 'User');
                if (userIndex === -1) return state;

                const newMembers = [...state.guild.members];
                newMembers[userIndex].contribution += (shards + (dust * 2));

                return {
                    guild: {
                        ...state.guild,
                        vault: {
                            shards: state.guild.vault.shards + shards,
                            dust: state.guild.vault.dust + dust
                        },
                        members: newMembers,
                        xp: state.guild.xp + (shards * 10)
                    }
                };
            })
        }),
        {
            name: 'riftbound-guild-storage'
        }
    )
);
