import { NextResponse } from "next/server";
import { runCodeChecks } from "@/lib/checks";
import { judge } from "@/lib/serv";
import type { Case, Decision } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const c: Case = {
    amount: Number(body.amount),
    vendor: String(body.vendor ?? ""),
    invoiceNumber: String(body.invoiceNumber ?? ""),
    notes: String(body.notes ?? ""),
  };

  const path = runCodeChecks(c);
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
    const j = await judge(c);
    path.push({ step: "model_judgment", type: "model", result: j.decision, detail: j.reason });
    return NextResponse.json({ decision: j.decision, reason: j.reason, path } satisfies Decision);
  } catch (e) {
    path.push({ step: "model_judgment", type: "model", result: "error", detail: String(e) });
    return NextResponse.json(
      { decision: "escalate", reason: "Model step failed, sent to a human", path } satisfies Decision,
    );
  }
}
