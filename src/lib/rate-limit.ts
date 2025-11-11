import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

export function getRateLimiter() {
  if (
    !ratelimit &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
        "1 m",
      ),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  return ratelimit;
}

export async function checkRateLimit(
  identifier: string,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = getRateLimiter();

  if (!limiter) {
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
    };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return { success, limit, remaining, reset };
}

export async function checkRateLimitForEndpoint(
  identifier: string,
  endpoint: string,
  customLimit?: number,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = getRateLimiter();

  if (!limiter) {
    return {
      success: true,
      limit: customLimit || 100,
      remaining: customLimit || 100,
      reset: Date.now() + 60000,
    };
  }

  const key = `${identifier}:${endpoint}`;
  const { success, limit, remaining, reset } = await limiter.limit(key);

  return { success, limit, remaining, reset };
}

export const RATE_LIMITS = {
  AI_SUMMARIZATION: 10,
  AI_TRANSCRIPTION: 5,
  FILE_UPLOAD: 20,
  PROJECT_CREATE: 10,
  API_DEFAULT: 100,
} as const;
