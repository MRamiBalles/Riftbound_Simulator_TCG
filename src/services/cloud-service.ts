import { createClient } from '@supabase/supabase-js';

// These would normally be environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Enterprise Cloud Service
 * Implements a "Hybrid Persistence" pattern: 
 * - Uses Supabase for cross-device sync if keys are present.
 * - Gracefully falls back to LocalStorage for offline/local development.
 */
export class CloudService {
    private static supabase = (SUPABASE_URL && SUPABASE_KEY)
        ? createClient(SUPABASE_URL, SUPABASE_KEY)
        : null;

    /**
     * Syncs the entire player progression to the cloud.
     */
    public static async syncPlayerData(userId: string, data: any) {
        if (this.supabase) {
            const { error } = await this.supabase
                .from('player_data')
                .upsert({
                    rift_id: userId,
                    state: data,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            return true;
        }
        // Local only "Sync" (Simulation)
        localStorage.setItem(`rift_cloud_sync_${userId}`, JSON.stringify(data));
        return true;
    }

    /**
     * Fetches player progression from the cloud.
     */
    public static async fetchPlayerData(userId: string) {
        if (this.supabase) {
            const { data, error } = await this.supabase
                .from('player_data')
                .select('state')
                .eq('rift_id', userId)
                .single();

            if (error) return null;
            return data.state;
        }
        const local = localStorage.getItem(`rift_cloud_sync_${userId}`);
        return local ? JSON.parse(local) : null;
    }

    /**
     * Saves a deck to the cloud or local storage.
     */
    public static async saveDeck(userId: string, deckData: any) {
        if (this.supabase) {
            const { error } = await this.supabase
                .from('decks')
                .upsert({
                    user_id: userId,
                    name: deckData.name,
                    deck_code: deckData.code,
                    description: deckData.description
                });

            if (error) throw error;
        } else {
            // LocalStorage Fallback (Existing Logic Bridge)
            console.log('[CloudService] Falling back to LocalStorage');
            const localDecks = JSON.parse(localStorage.getItem('riftbound_decks') || '[]');
            localDecks.push(deckData);
            localStorage.setItem('riftbound_decks', JSON.stringify(localDecks));
        }
    }

    /**
     * Fetches Global Meta Data for the dashboard.
     */
    public static async getGlobalMeta() {
        if (this.supabase) {
            const { data, error } = await this.supabase
                .from('meta_statistics')
                .select('*')
                .order('win_rate', { ascending: false });

            if (error) return this.getMockMeta();
            return data;
        }

        return this.getMockMeta();
    }

    private static getMockMeta() {
        return [
            { name: 'Noxus Aggro', win_rate: 0.58, total_plays: 1240 },
            { name: 'Demacia Elites', win_rate: 0.54, total_plays: 980 },
            { name: 'Freljord Control', win_rate: 0.51, total_plays: 850 }
        ];
    }
}
