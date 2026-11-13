import { NextResponse } from "next/server";
import { compileRule } from "@/lib/compile";
import { readBody } from "@/lib/input";
import { guard } from "@/lib/limit";

// Turns one plain-language rule into a structured rule with SERV Reasoning.
export async function POST(req: Request) {
  const limited = guard(req, "compile", { perMinute: 8, perHour: 60, allVisitorsPerHour: 300 });
  if (limited) return limited;

  const read = await readBody(req, 2_000);
  if (read.error) return read.error;
  try {
    return NextResponse.json(await compileRule(String(read.body.text ?? "")));
  } catch (e) {
    console.error("Rule compile failed:", e);
    return NextResponse.json({ error: "SERV did not answer just now. Please try again." });
  }
}
