import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Only initialise if env vars are present (graceful fallback for local dev)
function createRatelimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min per identifier
    analytics: true,
  })
}

const ratelimiter = createRatelimiter()

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  if (!ratelimiter) return { allowed: true, remaining: 999 }
  const { success, remaining } = await ratelimiter.limit(identifier)
  return { allowed: success, remaining }
}
