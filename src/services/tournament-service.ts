export interface TournamentMatch {
    id: string;
    player1: string;
    player2: string;
    winner?: string;
    level: number; // 0 (Finals) to 3 (Round of 16)
}

export interface Tournament {
    id: string;
    name: string;
    matches: TournamentMatch[];
    status: 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED';
    champion?: string;
}

export class TournamentService {
    public static generateBracket(): TournamentMatch[] {
        const players = ["User", "VoidWalker", "Nova_Stellar", "Kaelthas", "Yasuo_Main", "RiftMaster", "Hextech_X", "Chronos", "Nebula", "StarLord", "Shadow", "Lightbringer", "Omega_One", "Zenith", "Apex", "Zero"];
        const matches: TournamentMatch[] = [];

        // Round of 16 (8 matches)
        for (let i = 0; i < 8; i++) {
            matches.push({ id: `r16-${i}`, player1: players[i * 2], player2: players[i * 2 + 1], level: 3 });
        }

        // Round of 8 (4 matches) - Placeholders
        for (let i = 0; i < 4; i++) {
            matches.push({ id: `r8-${i}`, player1: 'TBD', player2: 'TBD', level: 2 });
        }

        // Semi-Finals (2 matches)
        for (let i = 0; i < 2; i++) {
            matches.push({ id: `s-${i}`, player1: 'TBD', player2: 'TBD', level: 1 });
        }

        // Finals (1 match)
        matches.push({ id: `f-0`, player1: 'TBD', player2: 'TBD', level: 0 });

        return matches;
    }

    public static simulateRound(matches: TournamentMatch[], level: number): TournamentMatch[] {
        const currentRoundMatches = matches.filter(m => m.level === level);
        const winners: string[] = [];

        currentRoundMatches.forEach(m => {
            m.winner = Math.random() > 0.5 ? m.player1 : m.player2;
            winners.push(m.winner);
        });

        // Advance winners to the next level
        if (level > 0) {
            const nextRoundMatches = matches.filter(m => m.level === level - 1);
            winners.forEach((winner, idx) => {
                const targetMatch = nextRoundMatches[Math.floor(idx / 2)];
                if (idx % 2 === 0) targetMatch.player1 = winner;
                else targetMatch.player2 = winner;
            });
        }

        return [...matches];
    }
}
