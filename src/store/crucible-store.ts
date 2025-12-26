import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BracketMatch {
    id: string;
    player1Id: string;
    player2Id: string;
    winnerId: string | null;
    round: number;
    status: 'PENDING' | 'LIVE' | 'COMPLETED';
}

export interface Tournament {
    id: string;
    name: string;
    status: 'SIGNUP' | 'ACTIVE' | 'FINISHED';
    participants: string[];
    matches: BracketMatch[];
}

interface CrucibleState {
    activeTournament: Tournament | null;

    // Actions
    createTournament: (name: string, players: string[]) => void;
    reportMatchResult: (matchId: string, winnerId: string) => void;
}

/**
 * Crucible Store (Phase 20)
 * Management for High-Stakes Tournament Brackets.
 */
export const useCrucibleStore = create<CrucibleState>()(
    persist(
        (set) => ({
            activeTournament: null,

            createTournament: (name, players) => set(state => {
                const matches: BracketMatch[] = [];
                // Simple 4-player bracket logic for MVP
                for (let i = 0; i < players.length; i += 2) {
                    matches.push({
                        id: `match-${i}`,
                        player1Id: players[i],
                        player2Id: players[i + 1] || 'BYE',
                        winnerId: null,
                        round: 1,
                        status: 'PENDING'
                    });
                }

                return {
                    activeTournament: {
                        id: `tourney-${Date.now()}`,
                        name,
                        status: 'ACTIVE',
                        participants: players,
                        matches
                    }
                };
            }),

            reportMatchResult: (matchId, winnerId) => set(state => {
                if (!state.activeTournament) return state;
                const newMatches = state.activeTournament.matches.map(m =>
                    m.id === matchId ? { ...m, winnerId, status: 'COMPLETED' as const } : m
                );

                // Logic for advancing to next round would go here

                return {
                    activeTournament: {
                        ...state.activeTournament,
                        matches: newMatches
                    }
                };
            })
        }),
        { name: 'riftbound-crucible-storage' }
    )
);
