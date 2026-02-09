"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayService = void 0;
const CoreEngine_1 = require("../game/engine/CoreEngine");
const card_service_1 = require("./card-service");
class ReplayService {
    /**
     * Creates a playback-ready engine instance from ReplayData.
     * Reconstructs the exact game state by re-playing actions from a fresh start.
     * @param replay - The recorded match data.
     * @param targetActionIdx - Optional stop point for partial playback.
     * @returns A CoreEngine instance at the target state.
     */
    static createPlaybackEngine(replay, targetActionIdx) {
        const engine = new CoreEngine_1.CoreEngine();
        const restoreDeck = (ids) => ids.map(id => card_service_1.MOCK_CARDS.find(c => c.id === id)).filter(Boolean);
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
    static serialize(replay) {
        const json = JSON.stringify(replay);
        return btoa(json); // Simple base64 for now
    }
    /**
     * Deserializes a replay string.
     */
    static deserialize(data) {
        const json = atob(data);
        return JSON.parse(json);
    }
    /**
     * Generates a shareable URL for a replay.
     */
    static getShareUrl(replay) {
        const serialized = this.serialize(replay);
        const baseUrl = window.location.origin;
        return `${baseUrl}/game?replay=${serialized}`;
    }
}
exports.ReplayService = ReplayService;
