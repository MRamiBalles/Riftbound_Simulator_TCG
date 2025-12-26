import { ReplayData, Action } from '../game/engine/game.types';
import { CoreEngine } from '../game/engine/CoreEngine';
import { MOCK_CARDS } from './card-service';

export class ReplayService {
    /**
     * Creates a playback-ready engine instance from ReplayData.
     */
    public static createPlaybackEngine(replay: ReplayData, targetActionIdx?: number): CoreEngine {
        const engine = new CoreEngine();

        const restoreDeck = (ids: string[]) => ids.map(id => MOCK_CARDS.find(c => c.id === id)).filter(Boolean) as any[];

        const p1Deck = restoreDeck(replay.initialState.p1Deck);
        const p2Deck = restoreDeck(replay.initialState.p2Deck);

        engine.initGame(p1Deck, p2Deck);

        const limit = targetActionIdx !== undefined ? targetActionIdx + 1 : replay.actions.length;

        // Re-apply actions without recording them (to avoid infinite loops)
        const actionsToApply = replay.actions.slice(0, limit);

        // We override applyAction recording temporarily if needed, 
        // or just accept that the new engine state will have its own actionHistory.
        actionsToApply.forEach(action => {
            engine.applyAction(action);
        });

        return engine;
    }

    /**
     * Serializes replay data to a compressed base64 string for sharing.
     */
    public static serialize(replay: ReplayData): string {
        const json = JSON.stringify(replay);
        return btoa(json); // Simple base64 for now
    }

    /**
     * Deserializes a replay string.
     */
    public static deserialize(data: string): ReplayData {
        const json = atob(data);
        return JSON.parse(json);
    }

    /**
     * Generates a shareable URL for a replay.
     */
    public static getShareUrl(replay: ReplayData): string {
        const serialized = this.serialize(replay);
        const baseUrl = window.location.origin;
        return `${baseUrl}/game?replay=${serialized}`;
    }
}
