import { NextResponse } from "next/server";
import { getPolicy, savePolicy } from "@/lib/policy";

export async function GET() {
  return NextResponse.json(getPolicy());
}

export async function PUT(req: Request) {
  const { policy, error } = savePolicy(await req.json());
  return error ? NextResponse.json({ error }, { status: 400 }) : NextResponse.json(policy);
}
