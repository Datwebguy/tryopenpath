import { NextResponse } from "next/server";
import { getPolicy, savePolicy } from "@/lib/policy";

export async function GET() {
  return NextResponse.json(getPolicy());
}

export async function PUT(req: Request) {
  return NextResponse.json(savePolicy(await req.json()));
}
