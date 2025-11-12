// app/api/generate-proposal/rate-limiter.ts
// Simple in-memory rate limiter for API protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // 10 requests per minute

  // Clean up expired entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    // First request from this identifier
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }

  if (now > entry.resetTime) {
    // Window expired, reset
    entry.count = 1;
    entry.resetTime = now + windowMs;
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  entry.count++;
  return { allowed: true };
}