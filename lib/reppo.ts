import type { Case, Decision, EvalResult } from "./types";

// Reppo Evaluation API. Endpoints follow https://eval.reppo.xyz/agents.md
const BASE = "https://eval.reppo.xyz/api/v1/agents/evals";

function headers() {
  return {
    Authorization: `Bearer ${process.env.REPPO_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export const reppoConfigured = () => !!process.env.REPPO_API_KEY;

// Keep error text short and readable (an HTML error page should not reach the UI).
async function fail(what: string, res: Response): Promise<never> {
  const body = await res.text();
  const text = body.trimStart().startsWith("<") ? "(non-JSON response)" : body.slice(0, 300);
  throw new Error(`Reppo ${what} ${res.status}: ${text}`);
}

// Submit the finished decision as an "action" for scoring. Reppo scores it in the background.
export async function submitEval(policy: string, c: Case, d: Decision): Promise<string> {
  const input = [
    `The user asked the agent to review this case under the policy below and decide whether to approve the payment.`,
    `Policy: ${policy}`,
    `Case: ${JSON.stringify(c)}`,
    `Agent action: decision "${d.decision}". Reason: ${d.reason}`,
    `Steps taken (steps typed "code" are fixed rules checked exactly with no AI, steps typed "model" are AI judgment calls):`,
    JSON.stringify(d.path),
    `Assess whether the decision follows the policy exactly, whether the reason is specific and correct, and whether fixed rules were checked exactly with the AI used only for judgment.`,
  ].join("\n");

  const res = await fetch(BASE, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ taskType: "action", input }),
  });
  if (!res.ok) await fail("submit", res);
  const data = await res.json();
  return data.id as string;
}

export async function readEval(evalId: string): Promise<EvalResult> {
  const res = await fetch(`${BASE}/${encodeURIComponent(evalId)}`, { headers: headers() });
  if (!res.ok) await fail("read", res);
  const data = await res.json();

  if (data.status === "COMPLETED") {
    const r = data.result ?? {};
    return {
      evalId,
      status: "SETTLED",
      score: r.score ?? data.score,
      verdict: r.decision,
      route: r.route ?? data.route,
      reason: r.reason,
      critiques: Object.entries((r.rubric_scores ?? {}) as Record<string, number>).map(
        ([criterion, score]) => ({ criterion, score }),
      ),
    };
  }
  if (data.status === "FAILED") {
    return { evalId, status: "FAILED", reason: data.error ? String(data.error) : "evaluation failed" };
  }
  return { evalId, status: "PENDING" }; // QUEUED or PROCESSING
}
