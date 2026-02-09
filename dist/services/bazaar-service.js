"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BazaarService = void 0;
/**
 * The Bazaar Service (P2P Marketplace)
 */
class BazaarService {
    static listings = [];
    static async getActiveListings() {
        // Simulate fetch
        await new Promise(r => setTimeout(r, 400));
        return this.listings.filter(l => l.status === 'ACTIVE');
    }
    static async createListing(seller, card, price, type) {
        const newListing = {
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
    static async purchaseListing(listingId, buyer) {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing && listing.status === 'ACTIVE') {
            listing.status = 'SOLD';
            // 5% of price as prestige for the buyer (investing in the ecosystem)
            const prestigeEarned = Math.floor(listing.price * 0.05);
            return { success: true, prestigeEarned };
        }
        return { success: false, prestigeEarned: 0 };
    }
    static getListingFee(price) {
        // 2% fee in Shards for listing, or free for premium users (handled in store)
        return Math.ceil(price * 0.02);
    }
}
exports.BazaarService = BazaarService;
