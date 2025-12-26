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

    public static async purchaseListing(listingId: string, buyer: string): Promise<boolean> {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing && listing.status === 'ACTIVE') {
            listing.status = 'SOLD';
            return true;
        }
        return false;
    }
}
