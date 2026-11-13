import { NextResponse } from "next/server";
import { runCodeChecks } from "@/lib/checks";
import { caseKey } from "@/lib/case";
import { routeLabel, stepLabel, verdictLabel } from "@/lib/format";
import { latestScored, vendorRunCount } from "@/lib/history";
import { judge } from "@/lib/judge";
import { kiteChecks } from "@/lib/kite";
import { getPolicy } from "@/lib/policy";
import { describeCond, ruleMatches, type RuleContext } from "@/lib/rules";
import type { Case, Decision, Step } from "@/lib/types";

const name = (s: Step) => s.label ?? stepLabel(s.step);

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

  // Your own rules, written in plain words and compiled by SERV.
  const ctx: RuleContext = {
    ...c,
    weekday: new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase(),
    earlierRuns: vendorRunCount(c.vendor),
  };
  for (const rule of policy.rules) {
    const hit = ruleMatches(rule, ctx);
    path.push({
      step: `rule_${rule.id}`,
      label: rule.label,
      type: "code",
      result: hit ? (rule.then === "deny" ? "failed" : "escalate") : "passed",
      detail: hit ? rule.reason : `Does not apply to this case. It applies when ${describeCond(rule.when)}.`,
    });
  }

  path.push({
    step: "load_feedback",
    type: "code",
    result: prior ? `previous score ${prior.score}/100` : "first run",
    detail: prior ? `${verdictLabel(prior.verdict ?? "")} · ${routeLabel(prior.route ?? "")}` : undefined,
  });

  const failed = path.filter((s) => s.result === "failed");
  const sentUp = path.filter((s) => s.step.startsWith("rule_") && s.result === "escalate");

  // A rule already decided this case, so the AI judgment is not needed.
  if (failed.length > 0 || sentUp.length > 0) {
    path.push({
      step: "model_judgment",
      type: "model",
      result: "skipped",
      detail: "A rule already decided this case, so the AI judgment was not needed.",
    });
    const out: Decision =
      failed.length > 0
        ? { decision: "deny", reason: `Denied by rule: ${failed.map((s) => name(s).toLowerCase()).join(", ")}`, path, ms: Date.now() - started }
        : { decision: "escalate", reason: `Sent to a person by rule: ${sentUp.map((s) => name(s).toLowerCase()).join(", ")}`, path, ms: Date.now() - started };
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
      ms: Date.now() - t,
    });
    const out: Decision = { decision: j.decision, reason: j.reason, path, ms: Date.now() - started };
    return NextResponse.json(out);
  } catch (e) {
    console.error("Judgment step failed:", e);
    path.push({
      step: "model_judgment",
      type: "model",
      result: "escalate",
      detail: "The AI provider did not return an answer.",
      ms: Date.now() - t,
    });
    const out: Decision = {
      decision: "escalate",
      reason: "The AI judgment did not come through, so this case goes to a person.",
      path,
      ms: Date.now() - started,
    };
    return NextResponse.json(out);
  }
}
