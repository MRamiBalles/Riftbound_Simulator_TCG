"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    buckets = new Map();
    capacity;
    refillRate; // Tokens per second
    constructor(capacity = 10, refillRate = 1) {
        this.capacity = capacity;
        this.refillRate = refillRate;
    }
    tryConsume(clientId, cost = 1) {
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
    cleanup(clientId) {
        this.buckets.delete(clientId);
    }
}
exports.RateLimiter = RateLimiter;
