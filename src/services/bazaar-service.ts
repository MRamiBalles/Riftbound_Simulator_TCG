import { Card } from '@/services/card-service';

export interface BazaarListing {
    id: string;
    seller: string;
    card: Card;
    price: number; // In Virtual Scraps
    type: 'REAL' | 'VIRTUAL';
    status: 'ACTIVE' | 'SOLD';
    timestamp: number;
}

/**
 * The Bazaar Service (P2P Marketplace)
 */
export class BazaarService {
    private static listings: BazaarListing[] = [];

    public static async getActiveListings(): Promise<BazaarListing[]> {
        // Simulate fetch
        await new Promise(r => setTimeout(r, 400));
        return this.listings.filter(l => l.status === 'ACTIVE');
    }

    public static async createListing(seller: string, card: Card, price: number, type: 'REAL' | 'VIRTUAL'): Promise<BazaarListing> {
        const newListing: BazaarListing = {
            id: `listing-${Math.random().toString(36).substr(2, 9)}`,
            seller,
            card,
            price,
            type,
            status: 'ACTIVE',
            timestamp: Date.now()
        };
        this.listings.push(newListing);
        return newListing;
    }

    public static async purchaseListing(listingId: string, buyer: string): Promise<{ success: boolean; prestigeEarned: number }> {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing && listing.status === 'ACTIVE') {
            listing.status = 'SOLD';
            // 5% of price as prestige for the buyer (investing in the ecosystem)
            const prestigeEarned = Math.floor(listing.price * 0.05);
            return { success: true, prestigeEarned };
        }
        return { success: false, prestigeEarned: 0 };
    }

    public static getListingFee(price: number): number {
        // 2% fee in Shards for listing, or free for premium users (handled in store)
        return Math.ceil(price * 0.02);
    }
}
