import { NextResponse } from "next/server";
import { findRunIn, updateRun } from "@/lib/history";
import { readBody } from "@/lib/input";
import { guard } from "@/lib/limit";
import { getPolicy } from "@/lib/policy";
import { reppoConfigured, submitEval } from "@/lib/reppo";
import { workspace } from "@/lib/workspace";

const inFlight = new Set<string>();

// Send one of this visitor's saved runs to Reppo for scoring.
// The decision comes from the saved run, never from the request, so it cannot be made up.
export async function POST(req: Request) {
  const limited = guard(req, "evaluate", { perMinute: 15, perHour: 150, allVisitorsPerHour: 400 });
  if (limited) return limited;

  const ws = await workspace();
  const read = await readBody(req, 1_000);
  if (read.error) return read.error;
  const runId = typeof read.body.runId === "string" ? read.body.runId : "";

  const run = findRunIn(ws, runId);
  if (!run) return NextResponse.json({ error: "That run was not found." }, { status: 404 });
  if (run.evalId) return NextResponse.json({ evalId: run.evalId, runId }); // already sent
  if (!reppoConfigured()) {
    return NextResponse.json({ error: "Scoring switches on once a Reppo key is added.", runId });
  }
  if (inFlight.has(runId)) return NextResponse.json({ error: "Scoring is already starting.", runId });

  inFlight.add(runId);
  try {
    const evalId = await submitEval(getPolicy(ws)?.text ?? "", run.case, run.decision);
    updateRun(ws, runId, { evalId });
    return NextResponse.json({ evalId, runId });
  } catch (e) {
    console.error("Reppo submit failed:", e);
    return NextResponse.json({ error: "Scoring did not start just now. Run the case again to score it.", runId });
  } finally {
    inFlight.delete(runId);
  }
}
