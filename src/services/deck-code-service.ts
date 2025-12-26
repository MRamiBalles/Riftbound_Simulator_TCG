/**
 * Handles encoding and decoding of deck card lists into shareable strings.
 * Uses a simple Base64 encoding of a CSV-like structure for better compression.
 */
export class DeckCodeService {
    /**
     * Encondes an array of card IDs into a shareable string.
     * Format: "RIFT[version]:[cardId],[count];..."
     */
    public static encode(cards: string[]): string {
        if (!cards || cards.length === 0) return '';

        // Count occurrences
        const counts: Record<string, number> = {};
        cards.forEach(id => counts[id] = (counts[id] || 0) + 1);

        // Build segment: cardId:count
        const segments = Object.entries(counts).map(([id, count]) => `${id}:${count}`);
        const raw = `V1|${segments.join(';')}`;

        return btoa(raw);
    }

    /**
     * Decodes a deck string back into an array of card IDs.
     */
    public static decode(code: string): string[] {
        try {
            const raw = atob(code);
            const [version, content] = raw.split('|');

            if (version !== 'V1') {
                console.error("[DeckCodeService] Unsupported deck code version:", version);
                return [];
            }

            const deck: string[] = [];
            const segments = content.split(';');

            segments.forEach(seg => {
                const [id, countStr] = seg.split(':');
                const count = parseInt(countStr, 10);
                for (let i = 0; i < count; i++) {
                    deck.push(id);
                }
            });

            return deck;
        } catch (e) {
            console.error("[DeckCodeService] Failed to decode deck code:", e);
            return [];
        }
    }
}
