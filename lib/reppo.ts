import type { Case, Decision, EvalResult } from "./types";

const BASE = "https://eval.reppo.xyz/api/v1/agents/eval-requests";

function headers() {
  return {
    Authorization: `Bearer ${process.env.REPPO_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export const reppoConfigured = () => !!process.env.REPPO_API_KEY;

const CRITERIA = [
  "Does the decision follow the stated policy exactly?",
  "Is the reason specific and correct for this case?",
  "Are hard rules checked by code steps, with a model used only for judgment?",
];

// Submit the decision trace for scoring. Reppo settles asynchronously.
export async function submitEval(policy: string, c: Case, d: Decision): Promise<string> {
  const res = await fetch(`${BASE}/submit`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      type: "trace",
      payload: JSON.stringify({ case: c, decision: d.decision, reason: d.reason, path: d.path }),
      criteria: CRITERIA,
      context: `Policy: ${policy}`,
      settlementMinutes: 10,
    }),
  });
  if (!res.ok) throw new Error(`Reppo submit ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.evalId as string;
}

export async function readEval(evalId: string): Promise<EvalResult> {
  const res = await fetch(`${BASE}/${encodeURIComponent(evalId)}`, { headers: headers() });
  if (!res.ok) throw new Error(`Reppo read ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const r = data.result;
  if (data.status === "SETTLED") {
    return {
      evalId,
      status: "SETTLED",
      score: r?.verdict?.score,
      verdict: r?.verdict?.decision,
      critiques: r?.verdicts,
    };
  }
  if (data.status === "FAILED") return { evalId, status: "FAILED", reason: r?.reason };
  return { evalId, status: "PENDING" };
}
