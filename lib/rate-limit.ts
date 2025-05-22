const tokenCache = new Map<string, number>();

export function rateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = tokenCache.get(ip) || 0;

  if (now - entry < windowMs) return false; // Too soon
  tokenCache.set(ip, now);
  return true;
}
