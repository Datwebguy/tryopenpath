import { execFile } from "node:child_process";
import type { Case, Step } from "./types";

// Kite Passport checks, run through the `kpass` CLI (Kite publishes no HTTP API yet).
// Set KPASS_BIN to the kpass binary. The server must be logged in to Passport with an
// approved spending session. Session amounts are USDC, treated 1:1 with the case amount in USD.

type Json = Record<string, unknown>;

function kpass(args: string[]): Promise<Json> {
  return new Promise((resolve, reject) => {
    execFile(
      process.env.KPASS_BIN as string,
      [...args, "--output", "json", "--no-interactive"],
      { timeout: 15000, maxBuffer: 5 * 1024 * 1024 },
      (err, stdout, stderr) => {
        let parsed: Json | null = null;
        try {
          parsed = JSON.parse(stdout) as Json;
        } catch {
          /* handled below */
        }
        // kpass reports failures as JSON: { status: "error", hint, message }
        if (parsed?.status === "error") return reject(new Error(String(parsed.hint ?? parsed.message ?? "kpass error")));
        if (err) return reject(new Error((stderr || err.message).toString().trim().slice(0, 300)));
        if (!parsed) return reject(new Error("kpass did not return JSON"));
        resolve(parsed);
      },
    );
  });
}

const num = (v: unknown) => {
  const n = typeof v === "string" || typeof v === "number" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};
const first = (o: Json, ...keys: string[]) => keys.map((k) => o[k]).find((v) => v !== undefined && v !== null);

type KSession = { perTx?: number; total?: number; spent: number; reserved: number; expires?: Date; status?: string };

function toSession(o: Json): KSession {
  const exp = first(o, "expires_at", "expiresAt");
  return {
    perTx: num(first(o, "max_amount_per_tx", "max_per_tx", "maxAmountPerTx")),
    total: num(first(o, "max_total_amount", "max_total", "maxTotalAmount")),
    spent: num(first(o, "spent_total", "spent", "spentTotal")) ?? 0,
    reserved: num(first(o, "reserved_total", "reserved", "reservedTotal")) ?? 0,
    expires: exp ? new Date(String(exp)) : undefined,
    status: first(o, "status") ? String(first(o, "status")) : undefined,
  };
}

async function activeSession(): Promise<KSession | null> {
  let raw: Json;
  try {
    raw = await kpass(["agent:session", "list", "--status", "active"]);
  } catch {
    raw = await kpass(["user", "sessions", "--status", "active"]); // same data, across all agents
  }
  const list = (Array.isArray(raw.sessions) ? raw.sessions : Array.isArray(raw.data) ? raw.data : []) as Json[];
  const now = Date.now();
  return (
    list
      .map(toSession)
      .find((s) => (!s.status || s.status === "active") && (!s.expires || s.expires.getTime() > now)) ?? null
  );
}

const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

function expiresIn(d: Date) {
  const h = Math.round((d.getTime() - Date.now()) / 3600000);
  return h >= 48 ? `${Math.round(h / 24)} days` : h >= 1 ? `${h} h` : "under an hour";
}

export const kiteConfigured = () => !!process.env.KPASS_BIN;

export async function kiteChecks(c: Case): Promise<Step[]> {
  // Kite checks join the path once a kpass CLI is connected.
  if (!kiteConfigured()) return [];

  const steps: Step[] = [];

  try {
    const me = await kpass(["me"]);
    const who = first(me, "email", "user_id");
    steps.push({ step: "kite_identity", type: "code", result: "passed", detail: who ? `signed in as ${who}` : undefined });
  } catch (e) {
    steps.push({ step: "kite_identity", type: "code", result: "failed", detail: String(e).replace(/^Error: /, "") });
    return steps; // identity comes first, so the session is checked only once it passes
  }

  try {
    const s = await activeSession();
    const fail = (detail: string) => steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail });

    if (!s) fail("no active Passport session. Approve one with kpass agent:session create");
    else if (s.perTx === undefined && s.total === undefined) fail("the active session reports no spending limits");
    else if (s.perTx !== undefined && c.amount > s.perTx) fail(`amount ${money(c.amount)} is over the session per-transaction limit of ${money(s.perTx)}`);
    else if (s.total !== undefined && c.amount > s.total - s.spent - s.reserved) {
      fail(`amount ${money(c.amount)} is over the session budget left: ${money(Math.max(0, s.total - s.spent - s.reserved))} of ${money(s.total)}`);
    } else {
      const parts: string[] = [];
      if (s.perTx !== undefined) parts.push(`per-transaction limit ${money(s.perTx)}`);
      if (s.total !== undefined) parts.push(`${money(s.total - s.spent - s.reserved)} left of ${money(s.total)}`);
      if (s.expires) parts.push(`expires in ${expiresIn(s.expires)}`);
      steps.push({ step: "kite_session_limit", type: "code", result: "passed", detail: parts.join(" · ") });
    }
  } catch (e) {
    steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail: String(e).replace(/^Error: /, "") });
  }
  return steps;
}
