// Simple in-memory rate limiter for MVP
// In production, use Redis or Vercel KV

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "session/create": { max: 5, windowMs: 60_000 },
  "interview/generate": { max: 3, windowMs: 60_000 },
  "interview/grade": { max: 5, windowMs: 10_000 },
};

export function rateLimit(
  identifier: string,
  endpoint: string
): { success: boolean } {
  const config = LIMITS[endpoint] || { max: 10, windowMs: 60_000 };
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true };
  }

  if (entry.count >= config.max) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);
