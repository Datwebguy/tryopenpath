import { NextResponse } from "next/server";
import { runCodeChecks } from "@/lib/checks";
import { caseKey, latestScored } from "@/lib/history";
import { judge } from "@/lib/judge";
import { getPolicy } from "@/lib/policy";
import type { Case, Decision } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const c: Case = {
    amount: Number(body.amount),
    vendor: String(body.vendor ?? ""),
    invoiceNumber: String(body.invoiceNumber ?? ""),
    notes: String(body.notes ?? ""),
  };

  // Feedback loop: look up the Reppo score from the last run of this same case.
  const prior = latestScored(caseKey(c))?.eval;
  const feedback = prior
    ? `Score ${prior.score}/100 (${prior.verdict}). ` +
      (prior.critiques ?? []).map((k) => `${k.criterion}: ${k.critique}`).join(" ")
    : undefined;

  const policy = getPolicy();
  const path = runCodeChecks(c, policy);
  path.push({
    step: "load_feedback",
    type: "code",
    result: prior ? `previous score ${prior.score}/100` : "none yet",
    detail: prior ? `verdict: ${prior.verdict}` : undefined,
  });
  const failed = path.filter((s) => s.result === "failed");

  // Hard rule failed: deny without calling a model.
  if (failed.length > 0) {
    path.push({ step: "model_judgment", type: "model", result: "skipped" });
    const out: Decision = {
      decision: "deny",
      reason: `Failed: ${failed.map((s) => s.step).join(", ")}`,
      path,
    };
    return NextResponse.json(out);
  }

  try {
    const j = await judge(policy.text, c, feedback);
    path.push({
      step: "model_judgment",
      type: "model",
      result: j.decision,
      detail: j.reason,
      provider: j.provider,
    });
    return NextResponse.json({ decision: j.decision, reason: j.reason, path } satisfies Decision);
  } catch (e) {
    path.push({ step: "model_judgment", type: "model", result: "error", detail: String(e) });
    return NextResponse.json(
      { decision: "escalate", reason: "Model step failed, sent to a human", path } satisfies Decision,
    );
  }
}
