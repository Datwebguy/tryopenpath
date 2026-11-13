import { NextResponse } from "next/server";
import { allRuns, clearRuns } from "@/lib/history";
import { guard } from "@/lib/limit";
import { workspace } from "@/lib/workspace";

// This visitor's runs, newest first.
export async function GET() {
  return NextResponse.json(allRuns(await workspace()));
}

// Removes this visitor's saved runs.
export async function DELETE(req: Request) {
  const limited = guard(req, "clear", { perMinute: 10, perHour: 60 });
  if (limited) return limited;
  return NextResponse.json({ cleared: clearRuns(await workspace()) });
}
