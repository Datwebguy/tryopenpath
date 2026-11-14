import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { caseKey } from "@/lib/case";
import { runCodeChecks } from "@/lib/checks";
import { routeLabel, stepLabel, verdictLabel } from "@/lib/format";
import { addRun, latestScored, vendorRunCount } from "@/lib/history";
import { parseCase, readBody } from "@/lib/input";
import { judge } from "@/lib/judge";
import { guard } from "@/lib/limit";
import { getPolicy } from "@/lib/policy";
import { maskAccount } from "@/lib/account";
import { describeCond, ruleMatches, type RuleContext } from "@/lib/rules";
import type { Decision, Step } from "@/lib/types";
import { workspace } from "@/lib/workspace";

const name = (s: Step) => s.label ?? stepLabel(s.step);

export async function POST(req: Request) {
  const limited = guard(req, "decide", { perMinute: 15, perHour: 150, allVisitorsPerHour: 600 });
  if (limited) return limited;

  const started = Date.now();
  const ws = await workspace();
  const read = await readBody(req, 8_000);
  if (read.error) return read.error;
  const parsed = parseCase(read.body);
  if (!parsed.case) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const c = parsed.case;

  const policy = getPolicy(ws);
  if (!policy) {
    return NextResponse.json({ error: "Save a policy first, then run a case." }, { status: 400 });
  }

  // Feedback loop: look up the Reppo score from the last run of this same case.
  const prior = latestScored(ws, caseKey(c))?.eval;
  const feedback = prior
    ? `Score ${prior.score}/100 (${prior.verdict}, route: ${prior.route}). ${prior.reason ?? ""} ` +
      (prior.critiques ?? []).map((k) => `${k.criterion}: ${k.score}/100`).join(", ")
    : undefined;

  const path = runCodeChecks(c, policy);

  // Your own rules, written in plain words and compiled by SERV.
  const ctx: RuleContext = {
    ...c,
    weekday: new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase(),
    earlierRuns: vendorRunCount(ws, c.vendor),
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

  // The server saves every run itself, so the decision on record is always the one it made.
  const finish = (decision: Decision) => {
    const id = randomUUID().replace(/-/g, "").slice(0, 10);
    addRun(ws, { id, caseKey: caseKey(c), case: c, decision, at: new Date().toISOString() });
    return NextResponse.json({ ...decision, runId: id });
  };

  const failed = path.filter((s) => s.result === "failed");
  const sentUp = path.filter((s) => s.type === "code" && s.result === "escalate");
  const bankChanged = sentUp.some((s) => s.step === "bank_account");

  // A rule already decided this case, so the AI judgment is not needed.
  if (failed.length > 0 || sentUp.length > 0) {
    path.push({
      step: "model_judgment",
      type: "model",
      result: "skipped",
      detail: "A rule already decided this case, so the AI judgment was not needed.",
    });
    return finish(
      failed.length > 0
        ? { decision: "deny", reason: `Denied by rule: ${failed.map((s) => name(s).toLowerCase()).join(", ")}`, path, ms: Date.now() - started }
        : {
            decision: "escalate",
            reason: bankChanged
              ? "Held: the bank details changed. Confirm with the vendor using contact details you already have before paying."
              : `Sent to a person by rule: ${sentUp.map((s) => name(s).toLowerCase()).join(", ")}`,
            path,
            ms: Date.now() - started,
          },
    );
  }

  const t = Date.now();
  try {
    // The AI only needs the last four digits of an account.
    const forAI = c.bankAccount ? { ...c, bankAccount: maskAccount(c.bankAccount) } : c;
    const j = await judge(policy.text, forAI, feedback);
    path.push({
      step: "model_judgment",
      type: "model",
      result: j.decision,
      detail: j.reason,
      provider: j.provider,
      ms: Date.now() - t,
    });
    return finish({ decision: j.decision, reason: j.reason, path, ms: Date.now() - started });
  } catch (e) {
    console.error("Judgment step failed:", e);
    path.push({
      step: "model_judgment",
      type: "model",
      result: "escalate",
      detail: "The AI provider did not return an answer.",
      ms: Date.now() - t,
    });
    return finish({
      decision: "escalate",
      reason: "The AI judgment did not come through, so this case goes to a person.",
      path,
      ms: Date.now() - started,
    });
  }
}
