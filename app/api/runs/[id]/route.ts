import { NextResponse } from "next/server";
import { findSharedRun, updateRun } from "@/lib/history";
import { guard } from "@/lib/limit";
import { readEval } from "@/lib/reppo";

// A shared run, read-only. The score is refreshed here while it is still being scored,
// so viewers never need access to anything else. The internal score id is not shared.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const limited = guard(req, "shared", { perMinute: 60, perHour: 1200 });
  if (limited) return limited;

  const { id } = await ctx.params;
  const found = findSharedRun(id);
  if (!found) return NextResponse.json({ error: "Run not found." }, { status: 404 });

  let { run } = found;
  const done = run.eval?.status === "SETTLED" || run.eval?.status === "FAILED";
  if (run.evalId && !done) {
    try {
      const result = await readEval(run.evalId);
      if (result.status !== "PENDING") {
        updateRun(found.ws, run.id, { eval: result });
        run = { ...run, eval: result };
      }
    } catch (e) {
      console.error("Shared score refresh failed:", e);
    }
  }

  const { evalId, ...shared } = run;
  const stillScoring = !!evalId && run.eval?.status !== "SETTLED" && run.eval?.status !== "FAILED";
  return NextResponse.json({ ...shared, pending: stillScoring });
}
