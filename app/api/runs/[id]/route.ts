import { NextResponse } from "next/server";
import { findRun } from "@/lib/history";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const run = findRun(id);
  return run ? NextResponse.json(run) : NextResponse.json({ error: "Run not found." }, { status: 404 });
}
