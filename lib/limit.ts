import { NextResponse } from "next/server";

// A small in-memory rate limiter. It protects the routes that spend SERV and Reppo credits.
const g = globalThis as unknown as { __openpathHits?: Map<string, number[]> };
const hits = (g.__openpathHits ??= new Map<string, number[]>());

function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= 3600_000)) hits.delete(k);
  }
  return true;
}

// Behind one trusted proxy, the last address in X-Forwarded-For is the one the proxy saw.
export function clientIp(req: Request) {
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  const parts = (req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "local";
}

type Limits = { perMinute: number; perHour: number; allVisitorsPerHour?: number };

// Returns a ready-made 429 response when a limit is hit, otherwise null.
export function guard(req: Request, name: string, l: Limits): NextResponse | null {
  const ip = clientIp(req);
  const ok =
    allow(`${name}:${ip}:m`, l.perMinute, 60_000) &&
    allow(`${name}:${ip}:h`, l.perHour, 3600_000) &&
    (l.allVisitorsPerHour === undefined || allow(`${name}:all`, l.allVisitorsPerHour, 3600_000));
  return ok
    ? null
    : NextResponse.json({ error: "Lots of activity right now. Please wait a minute and try again." }, { status: 429 });
}
