/**
 * Lightweight in-memory rate limiter for OTP endpoints
 * Protects against OTP spam, email bombing, and brute-force guessing
 */

class SlidingRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 10 * 60 * 1000; // 10 minutes default
    this.maxRequests = options.maxRequests || 5;
    this.message = options.message || 'Too many OTP requests. Please try again later.';
    this.hits = new Map();

    // Clean up expired entries every 5 minutes to prevent memory leaks
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(t => now - t < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }

  middleware() {
    return async (c, next) => {
      const now = Date.now();
      const ip =
        c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
        c.req.header('cf-connecting-ip') ||
        '127.0.0.1';

      // We can also extract email from body if present, to rate limit per IP + email combination
      let email = '';
      try {
        const cloned = c.req.raw.clone();
        const json = await cloned.json();
        if (json && json.email) {
          email = String(json.email).trim().toLowerCase();
        }
      } catch {
        // Not a json request or already consumed
      }

      const key = email ? `${ip}_${email}` : ip;
      const history = this.hits.get(key) || [];
      const validHistory = history.filter(t => now - t < this.windowMs);

      if (validHistory.length >= this.maxRequests) {
        c.header('Retry-After', String(Math.ceil(this.windowMs / 1000)));
        return c.json({
          success: false,
          message: this.message
        }, 429);
      }

      validHistory.push(now);
      this.hits.set(key, validHistory);

      await next();
    };
  }
}

// 1. Send / Resend / Register OTP Limiter (5 requests per 10 minutes)
export const otpSendRateLimiter = new SlidingRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many verification code requests. Please wait a few minutes before trying again.'
}).middleware();

// 2. Verify OTP Limiter (10 verification attempts per 10 minutes)
export const otpVerifyRateLimiter = new SlidingRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many verification attempts. Please wait before trying again.'
}).middleware();
