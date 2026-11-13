import { NextResponse } from "next/server";
import { caseKey } from "@/lib/case";
import { addRun } from "@/lib/history";
import { getPolicy } from "@/lib/policy";
import { reppoConfigured, submitEval } from "@/lib/reppo";
import type { Case, Decision, Run } from "@/lib/types";

// Submit a finished decision to Reppo and remember the run.
export async function POST(req: Request) {
  const { case: c, decision } = (await req.json()) as { case: Case; decision: Decision };
  const run: Run = { caseKey: caseKey(c), case: c, decision, at: new Date().toISOString() };

  if (!reppoConfigured()) {
    addRun(run);
    return NextResponse.json({ error: "Scoring switches on once a Reppo key is added." }, { status: 200 });
  }

  try {
    run.evalId = await submitEval(getPolicy()?.text ?? "", c, decision);
    addRun(run);
    return NextResponse.json({ evalId: run.evalId });
  } catch (e) {
    addRun(run);
    return NextResponse.json({ error: String(e) }, { status: 200 });
  }
}
