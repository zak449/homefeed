interface RateLimitConfig {
  interval: number; // ms
  maxRequests: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter.
 * Takes an identifier (e.g. IP address) and a config, returns whether the
 * request is allowed and how many requests remain in the current window.
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  // Clean up expired entries periodically (every call, cheap enough for moderate traffic)
  for (const [key, entry] of rateLimitMap) {
    if (entry.expiresAt <= now) {
      rateLimitMap.delete(key);
    }
  }

  const key = `${identifier}:${config.interval}:${config.maxRequests}`;
  const entry = rateLimitMap.get(key);

  if (!entry || entry.expiresAt <= now) {
    // First request in this window
    rateLimitMap.set(key, { count: 1, expiresAt: now + config.interval });
    return { success: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: config.maxRequests - entry.count };
}
