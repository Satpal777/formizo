import type { Request, RequestHandler, Response } from "express";

interface RateLimitEntry {
  requests: number[];
}

export interface RateLimitStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  enabled?: boolean;
  keyGenerator?: (req: Request) => string;
  store?: RateLimitStore;
}

class MemoryRateLimitStore implements RateLimitStore {
  private readonly clients = new Map<string, RateLimitEntry>();

  get(key: string) {
    return this.clients.get(key);
  }

  set(key: string, entry: RateLimitEntry) {
    this.clients.set(key, entry);
  }

  delete(key: string) {
    this.clients.delete(key);
  }
}

function defaultKeyGenerator(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function getFreshRequests(requests: number[], windowStart: number) {
  return requests.filter((requestTime) => requestTime > windowStart);
}

function getResetSeconds(requests: number[], windowMs: number) {
  const oldestRequest = requests[0];

  if (!oldestRequest) {
    return 1;
  }

  return Math.max(Math.ceil((oldestRequest + windowMs - Date.now()) / 1000), 1);
}

function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  resetSeconds: number,
) {
  res.setHeader("RateLimit-Limit", limit);
  res.setHeader("RateLimit-Remaining", remaining);
  res.setHeader("RateLimit-Reset", resetSeconds);
}

function updateClientRequests(store: RateLimitStore, key: string, windowMs: number, max: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entry = store.get(key);
  const requests = entry ? getFreshRequests(entry.requests, windowStart) : [];

  if (requests.length >= max) {
    store.set(key, { requests });
    return { allowed: false, requests };
  }

  requests.push(now);
  store.set(key, { requests });

  return { allowed: true, requests };
}

export function createRateLimit(options: RateLimitOptions): RequestHandler {
  const enabled = options.enabled ?? true;
  const store = options.store ?? new MemoryRateLimitStore();
  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;

  return (req, res, next) => {
    if (!enabled) {
      return next();
    }

    const { allowed, requests } = updateClientRequests(
      store,
      keyGenerator(req),
      options.windowMs,
      options.max,
    );

    console.log(`Rate limit check for ${keyGenerator(req)}: allowed=${allowed}, requests=${requests.length}`);

    const remaining = Math.max(options.max - requests.length, 0);
    const resetSeconds = getResetSeconds(requests, options.windowMs);

    setRateLimitHeaders(res, options.max, remaining, resetSeconds);

    if (allowed) {
      return next();
    }

    res.setHeader("Retry-After", resetSeconds);

    return res.status(429).json({
      message: "Too many requests",
      retryAfter: resetSeconds,
    });
  };
}
