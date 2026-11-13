import { NextResponse } from "next/server";

// Which integrations are set up. Only yes/no values leave the server, never keys.
export async function GET() {
  const e = process.env;
  return NextResponse.json({
    serv: !!(e.SERV_API_KEY && e.SERV_MODEL),
    dolphin: !!(e.DOLPHIN_API_KEY && e.DOLPHIN_MODEL),
    reppo: !!e.REPPO_API_KEY,
    kite: !!e.KPASS_BIN,
  });
}
