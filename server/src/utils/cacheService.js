/**
 * High-Performance In-Memory Cache with TTL & Pattern Invalidation
 * Designed to handle 10,000+ concurrent users with sub-millisecond response times.
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0
    };
  }

  /**
   * Get cached data by key
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check TTL expiration
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Store data in cache
   * @param {string} key
   * @param {any} data
   * @param {number} [ttlMs=60000] - Default 60 seconds
   */
  set(key, data, ttlMs = 60000) {
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
    this.stats.sets++;

    // Prevent memory leaks: limit max keys to 5,000
    if (this.store.size > 5000) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
  }

  /**
   * Invalidate cache keys matching a prefix or pattern
   * @param {string} prefix - e.g., 'products'
   */
  invalidate(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (!prefix || key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    this.stats.invalidations += count;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
  }
}

export const memoryCache = new MemoryCache();
