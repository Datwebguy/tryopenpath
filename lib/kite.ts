import { execFile } from "node:child_process";
import type { Case, Step } from "./types";

// Kite Passport checks, run through the `kpass` CLI (there is no public HTTP API).
// Set KPASS_BIN to the kpass binary path to turn this on. The server must already be
// logged in to Passport with an approved, active spending session.

function kpass(args: string[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    execFile(
      process.env.KPASS_BIN as string,
      [...args, "--output", "json", "--no-interactive"],
      { timeout: 15000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error((stderr || err.message).toString().trim().slice(0, 300)));
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error("kpass did not return JSON"));
        }
      },
    );
  });
}

const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

// Depth-first search for the first value whose key matches the pattern.
function find(obj: unknown, re: RegExp): unknown {
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const r = find(v, re);
      if (r !== undefined) return r;
    }
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (re.test(norm(k)) && (typeof v === "string" || typeof v === "number")) return v;
    }
    for (const v of Object.values(obj)) {
      const r = find(v, re);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

export const kiteConfigured = () => !!process.env.KPASS_BIN;

export async function kiteChecks(c: Case): Promise<Step[]> {
  if (!kiteConfigured()) {
    return [
      {
        step: "kite_passport",
        type: "code",
        result: "not configured",
        detail: "KPASS_BIN is not set, so only the policy spending limit is enforced",
      },
    ];
  }

  const steps: Step[] = [];

  try {
    const me = await kpass(["me"]);
    const who = find(me, /^(email|userid|agentid|id|name)$/);
    steps.push({ step: "kite_identity", type: "code", result: "passed", detail: who ? `signed in as ${who}` : undefined });
  } catch (e) {
    steps.push({ step: "kite_identity", type: "code", result: "failed", detail: String(e) });
    return steps; // no identity, no point checking the session
  }

  // Fail closed: if the session or its limits cannot be read, the check fails.
  try {
    const sessions = await kpass(["agent:session", "list", "--status", "active"]);
    const perTx = Number(find(sessions, /^max.*per.*(tx|transaction)/));
    const total = Number(find(sessions, /^max.*total/));
    if (find(sessions, /^max/) === undefined) {
      steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail: "no active Passport session with limits" });
    } else if (Number.isFinite(perTx) && c.amount > perTx) {
      steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail: `amount ${c.amount} exceeds the session per-transaction limit ${perTx}` });
    } else if (Number.isFinite(total) && c.amount > total) {
      steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail: `amount ${c.amount} exceeds the session total ${total}` });
    } else if (!Number.isFinite(perTx) && !Number.isFinite(total)) {
      steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail: "could not read the session limits" });
    } else {
      steps.push({
        step: "kite_session_limit",
        type: "code",
        result: "passed",
        detail: `per-transaction ${Number.isFinite(perTx) ? perTx : "n/a"}, session total ${Number.isFinite(total) ? total : "n/a"}`,
      });
    }
  } catch (e) {
    steps.push({ step: "kite_session_limit", type: "code", result: "failed", detail: String(e) });
  }
  return steps;
}
