/**
 * H2: Per-user LLM rate limiter
 *
 * Enforces a maximum of 10 LLM calls per user per minute.
 * Uses an in-memory sliding window — sufficient for single-replica deployments.
 * For multi-replica setups, replace with a Redis-backed counter.
 */

const MAX_CALLS_PER_WINDOW = 10;
const WINDOW_MS = 60_000; // 1 minute

/** Map from userId → array of call timestamps within the current window */
const userCallTimestamps = new Map<number, number[]>();

/**
 * Check if the user has exceeded the LLM rate limit.
 * Returns true if the call is allowed, false if rate-limited.
 * Automatically records the call if allowed.
 */
export function checkLlmRateLimit(userId: number): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  let timestamps = userCallTimestamps.get(userId) ?? [];
  // Evict expired timestamps
  timestamps = timestamps.filter(t => t > windowStart);

  if (timestamps.length >= MAX_CALLS_PER_WINDOW) {
    return false;
  }

  timestamps.push(now);
  userCallTimestamps.set(userId, timestamps);
  return true;
}

/** Periodically clean up stale entries to prevent memory growth */
setInterval(() => {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  Array.from(userCallTimestamps.entries()).forEach(([userId, timestamps]) => {
    const fresh = timestamps.filter((t: number) => t > windowStart);
    if (fresh.length === 0) {
      userCallTimestamps.delete(userId);
    } else {
      userCallTimestamps.set(userId, fresh);
    }
  });
}, 5 * 60_000); // Clean up every 5 minutes
