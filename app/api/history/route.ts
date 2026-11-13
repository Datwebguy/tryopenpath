import { NextResponse } from "next/server";
import { allRuns } from "@/lib/history";

export async function GET() {
  return NextResponse.json(allRuns());
}
