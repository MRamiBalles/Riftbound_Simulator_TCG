export class NameGenService {
    private static patterns: Record<string, string[]> = {
        'Demacia': ['Justice', 'Vanguard', 'Light', 'Steel', 'Honor', 'Shield'],
        'Noxus': ['Blood', 'Empire', 'Might', 'Siege', 'Blade', 'Legion'],
        'Ionia': ['Spirit', 'Grace', 'Harmony', 'Lotus', 'Calm', 'Wind'],
        'Freljord': ['Frost', 'Winter', 'North', 'Ice', 'Wolf', 'Heart'],
        'Shadow Isles': ['Mist', 'Grave', 'Sorrow', 'Wraith', 'Night', 'Doom'],
        'Void': ['Breach', 'Voidborn', 'Null', 'Hunger', 'Echo', 'Chaos'],
        'Universal': ['Legacy', 'Odyssey', 'Apex', 'Core', 'Nexus', 'Breach']
    };

    private static templates = [
        "The [P1] of [P2]",
        "[P1]'s [P2]",
        "[P1] [P2]",
        "Dawn of [P1]",
        "Echoes from [P1]"
    ];

    public static generate(regions: string[]): string {
        const primary = regions[0] || 'Universal';
        const secondary = regions[1] || primary;

        const pool1 = this.patterns[primary] || this.patterns['Universal'];
        const pool2 = this.patterns[secondary] || this.patterns['Universal'];

        const p1 = pool1[Math.floor(Math.random() * pool1.length)];
        const p2 = pool2[Math.floor(Math.random() * pool2.length)];

        const template = this.templates[Math.floor(Math.random() * this.templates.length)];

        return template
            .replace('[P1]', p1)
            .replace('[P2]', p2 === p1 ? 'Eternity' : p2);
    }
}
