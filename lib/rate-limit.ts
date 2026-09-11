/**
 * A per-IP window, in memory.
 *
 * Shared by the two public forms so there is one implementation to reason
 * about rather than a copy per route that quietly drifts.
 *
 * Deliberately modest: this is one serverless instance's view of the world, so
 * a flood spread across instances gets more through than the numbers suggest.
 * It stops the common case — one script hammering one endpoint — without
 * adding a Redis dependency to a site that has no other use for one. If the
 * spam ever justifies it, this is the file to replace.
 */

const WINDOW_MS = 10 * 60 * 1000;
/** Enough for someone filling a form in twice after mistyping an address. */
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/** The caller's address, as far as the proxy in front of us will say. */
export function callerIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function overLimit(ip: string, max = MAX_PER_WINDOW) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  /* The map would otherwise grow for the life of the instance. */
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > max;
}
