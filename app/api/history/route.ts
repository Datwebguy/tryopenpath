import { NextResponse } from "next/server";
import { allRuns, clearRuns } from "@/lib/history";

export async function GET() {
  return NextResponse.json(allRuns());
}

// Removes every saved run.
export async function DELETE() {
  return NextResponse.json({ cleared: clearRuns() });
}
