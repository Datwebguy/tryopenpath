import { NextResponse } from "next/server";
import { findSharedRun } from "@/lib/history";
import { guard } from "@/lib/limit";
import { showcaseEntries } from "@/lib/showcase";

// The real runs shown under "See it in action".
export async function GET(req: Request) {
  const limited = guard(req, "showcase", { perMinute: 60, perHour: 1200 });
  if (limited) return limited;

  const items = showcaseEntries().flatMap((e) => {
    const found = findSharedRun(e.id);
    if (!found) return [];
    const { run } = found;
    const path = run.decision.path;
    const ai = path.find((s) => s.step === "model_judgment");
    return [{
      id: run.id,
      title: e.title,
      note: e.note,
      vendor: run.case.vendor,
      amount: run.case.amount,
      notes: run.case.notes,
      decision: run.decision.decision,
      reason: run.decision.reason,
      decidedBy: ai?.result === "skipped" ? "rule" : "ai",
      ruleChecks: path.filter((s) => s.type === "code").length,
      score: run.eval?.status === "SETTLED" ? run.eval.score : undefined,
    }];
  });
  return NextResponse.json(items);
}
