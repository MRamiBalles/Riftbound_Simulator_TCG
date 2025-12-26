export interface AuctionItem {
    id: string;
    cardId: string;
    cardName: string;
    rarity: string;
    image_url: string;
    currentBid: number;
    highestBidder: string;
    endTime: number;
    status: 'ACTIVE' | 'ENDED';
    isPremium?: boolean;
}

/**
 * Auction Service (Phase 24)
 * Simulates the high-stakes real-time bidding system for the Bazaar.
 */
export class AuctionService {
    private static AUCTIONS: AuctionItem[] = [
        {
            id: 'auc-001',
            cardId: 'card-legacy-001',
            cardName: 'Lux: The Kingslayer',
            rarity: 'Legendary',
            image_url: 'https://riftbound.gg/cards/lux-kingslayer.png',
            currentBid: 1250,
            highestBidder: 'RiftWalker_99',
            endTime: Date.now() + 3600000, // 1 hour
            status: 'ACTIVE',
            isPremium: true
        },
        {
            id: 'auc-002',
            cardId: 'card-forge-772',
            cardName: 'Void Sentinel',
            rarity: 'Epic',
            image_url: 'https://riftbound.gg/cards/void-sentinel.png',
            currentBid: 3200,
            highestBidder: 'NexusGuardian',
            endTime: Date.now() + 1800000, // 30 mins
            status: 'ACTIVE'
        }
    ];

    public static async getActiveAuctions(): Promise<AuctionItem[]> {
        return this.AUCTIONS;
    }

    public static async placeBid(auctionId: string, amount: number, userId: string): Promise<boolean> {
        const auction = this.AUCTIONS.find(a => a.id === auctionId);
        if (auction && auction.status === 'ACTIVE' && amount > auction.currentBid) {
            auction.currentBid = amount;
            auction.highestBidder = userId;
            return true;
        }
        return false;
    }
}
