import { headers } from "next/headers";
import { redis } from "./redis";

/**
 * Redis-backed Rate Limiter for Enterprise scale.
 * 
 * @param identifier The unique identifier (e.g. User IP)
 * @param action The action being rate-limited (e.g. "LOGIN")
 * @param limit Maximum number of allowed requests in the window
 * @param windowMs Time window in milliseconds
 * @returns Rate limit status
 */
export async function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; resetAt: number }> {
  const key = `ratelimit:${action}:${identifier}`;
  
  try {
    // Lua script to perform INCR and PEXPIRE atomically
    // This eliminates any race conditions where a key might be incremented but never expire
    const script = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("PEXPIRE", KEYS[1], ARGV[1])
      end
      return {current, redis.call("PTTL", KEYS[1])}
    `;

    const result = await redis.eval(script, 1, key, windowMs) as [number, number];
    const currentCount = result[0];
    const ttl = result[1];

    const resetAt = Date.now() + (ttl > 0 ? ttl : windowMs);

    return {
      success: currentCount <= limit,
      limit,
      remaining: Math.max(0, limit - currentCount),
      resetAt,
    };
  } catch (error) {
    console.error("Redis Rate Limit Error:", error);
    // Fallback to allowing the request if Redis fails to prevent blocking real users
    return {
      success: true,
      limit,
      remaining: 1,
      resetAt: Date.now() + windowMs,
    };
  }
}

/**
 * Helper to get the client IP address from the request headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return headersList.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}
