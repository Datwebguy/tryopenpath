import { NextResponse } from "next/server";
import { runCodeChecks } from "@/lib/checks";
import { caseKey } from "@/lib/case";
import { latestScored } from "@/lib/history";
import { judge } from "@/lib/judge";
import { kiteChecks } from "@/lib/kite";
import { getPolicy } from "@/lib/policy";
import type { Case, Decision } from "@/lib/types";

export async function POST(req: Request) {
  const started = Date.now();
  const body = await req.json();
  const c: Case = {
    amount: Number(body.amount),
    vendor: String(body.vendor ?? ""),
    invoiceNumber: String(body.invoiceNumber ?? ""),
    notes: String(body.notes ?? ""),
  };

  const policy = getPolicy();
  if (!policy) {
    return NextResponse.json({ error: "Save a policy first, then run a case." }, { status: 400 });
  }

  // Feedback loop: look up the Reppo score from the last run of this same case.
  const prior = latestScored(caseKey(c))?.eval;
  const feedback = prior
    ? `Score ${prior.score}/100 (${prior.verdict}, route: ${prior.route}). ${prior.reason ?? ""} ` +
      (prior.critiques ?? []).map((k) => `${k.criterion}: ${k.score}/100`).join(", ")
    : undefined;

  const path = [...runCodeChecks(c, policy), ...(await kiteChecks(c))];
  path.push({
    step: "load_feedback",
    type: "code",
    result: prior ? `previous score ${prior.score}/100` : "first run",
    detail: prior ? `verdict: ${prior.verdict}, route: ${prior.route}` : undefined,
  });
  const failed = path.filter((s) => s.result === "failed");

  // A hard rule failed: the decision is made by code, so the model is not called.
  if (failed.length > 0) {
    path.push({
      step: "model_judgment",
      type: "model",
      result: "skipped",
      detail: "A hard rule already decided this case, so no model judgment is needed.",
    });
    const out: Decision = {
      decision: "deny",
      reason: `Denied by rule: ${failed.map((s) => s.step.replace(/_/g, " ")).join(", ")}`,
      path,
      ms: Date.now() - started,
    };
    return NextResponse.json(out);
  }

  const t = Date.now();
  try {
    const j = await judge(policy.text, c, feedback);
    path.push({
      step: "model_judgment",
      type: "model",
      result: j.decision,
      detail: j.reason,
      provider: j.provider,
      fallbacks: j.failed.length ? j.failed : undefined,
      ms: Date.now() - t,
    });
    const out: Decision = { decision: j.decision, reason: j.reason, path, ms: Date.now() - started };
    return NextResponse.json(out);
  } catch (e) {
    path.push({
      step: "model_judgment",
      type: "model",
      result: "escalate",
      detail: String(e).replace(/^Error: /, "").slice(0, 300),
      ms: Date.now() - t,
    });
    const out: Decision = {
      decision: "escalate",
      reason: "The judgment step could not answer, so this case goes to a person.",
      path,
      ms: Date.now() - started,
    };
    return NextResponse.json(out);
  }
}
