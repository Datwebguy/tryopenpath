import { NextResponse } from "next/server";
import { findRunByEval, setEval } from "@/lib/history";
import { guard } from "@/lib/limit";
import { readEval } from "@/lib/reppo";
import { workspace } from "@/lib/workspace";

// Poll a Reppo evaluation. It must belong to a run in this visitor's workspace.
// When it settles, the score is saved on the run.
export async function GET(req: Request, ctx: { params: Promise<{ evalId: string }> }) {
  const limited = guard(req, "score", { perMinute: 60, perHour: 1200 });
  if (limited) return limited;

  const { evalId } = await ctx.params;
  const ws = await workspace();
  const run = findRunByEval(ws, evalId);
  if (!run) return NextResponse.json({ error: "That score was not found." }, { status: 404 });

  try {
    const result = await readEval(evalId);
    if (result.status !== "PENDING") setEval(ws, run.id, result);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Reppo read failed:", e);
    return NextResponse.json({ error: "The score could not be read just now." });
  }
}
