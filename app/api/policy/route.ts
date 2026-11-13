import { NextResponse } from "next/server";
import { readBody } from "@/lib/input";
import { guard } from "@/lib/limit";
import { clearPolicy, getPolicy, savePolicy } from "@/lib/policy";
import { workspace } from "@/lib/workspace";

export async function GET() {
  return NextResponse.json(getPolicy(await workspace()));
}

// Removes this visitor's policy so the console starts fresh.
export async function DELETE(req: Request) {
  const limited = guard(req, "policy", { perMinute: 20, perHour: 200 });
  if (limited) return limited;
  clearPolicy(await workspace());
  return NextResponse.json({ cleared: true });
}

export async function PUT(req: Request) {
  const limited = guard(req, "policy", { perMinute: 20, perHour: 200 });
  if (limited) return limited;
  const read = await readBody(req, 200_000);
  if (read.error) return read.error;
  const { policy, error } = savePolicy(await workspace(), read.body);
  return error ? NextResponse.json({ error }, { status: 400 }) : NextResponse.json(policy);
}
