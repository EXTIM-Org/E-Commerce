import { redis } from './redis';

/**
 * Fetches data from Redis cache or executes the fetcher function and caches the result.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error(`[Redis] Cache read error for key: ${key}`, error);
  }

  // Cache miss or Redis error, run the actual fetcher
  const data = await fetcher();

  // Don't cache empty or undefined data to prevent cache poisoning
  if (data !== undefined && data !== null) {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (error) {
      console.error(`[Redis] Cache write error for key: ${key}`, error);
    }
  }

  return data;
}

/**
 * Invalidates specific cache keys using a wildcard pattern.
 * e.g., invalidateCachePattern('cache:products:*')
 */
export async function invalidateCachePattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis] Invalidated ${keys.length} keys matching ${pattern}`);
    }
  } catch (error) {
    console.error(`[Redis] Failed to invalidate cache pattern: ${pattern}`, error);
  }
}
