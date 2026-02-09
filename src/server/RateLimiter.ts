
interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

export class RateLimiter {
    private buckets: Map<string, TokenBucket> = new Map();
    private readonly capacity: number;
    private readonly refillRate: number; // Tokens per second

    constructor(capacity: number = 10, refillRate: number = 1) {
        this.capacity = capacity;
        this.refillRate = refillRate;
    }

    public tryConsume(clientId: string, cost: number = 1): boolean {
        const now = Date.now();
        let bucket = this.buckets.get(clientId);

        if (!bucket) {
            bucket = { tokens: this.capacity, lastRefill: now };
            this.buckets.set(clientId, bucket);
        }

        // Refill
        const elapsedSeconds = (now - bucket.lastRefill) / 1000;
        const tokensToAdd = elapsedSeconds * this.refillRate;
        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;

        if (bucket.tokens >= cost) {
            bucket.tokens -= cost;
            return true;
        }

        return false;
    }

    public cleanup(clientId: string) {
        this.buckets.delete(clientId);
    }
}
