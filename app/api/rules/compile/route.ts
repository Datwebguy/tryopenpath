import { NextResponse } from "next/server";
import { compileRule } from "@/lib/compile";

// Turns one plain-language rule into a structured rule with SERV Reasoning.
export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const out = await compileRule(String(text ?? ""));
    return NextResponse.json(out);
  } catch (e) {
    console.error("Rule compile failed:", e);
    return NextResponse.json({ error: "SERV did not answer just now. Please try again." });
  }
}
