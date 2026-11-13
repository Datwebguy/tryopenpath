import { NextResponse } from "next/server";
import { setEval } from "@/lib/history";
import { readEval } from "@/lib/reppo";

// Poll a Reppo evaluation. When it settles, the score is stored on the run.
export async function GET(_req: Request, ctx: { params: Promise<{ evalId: string }> }) {
  const { evalId } = await ctx.params;
  try {
    const result = await readEval(evalId);
    if (result.status !== "PENDING") setEval(evalId, result);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 200 });
  }
}
