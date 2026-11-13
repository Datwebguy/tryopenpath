import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "op_ws";
const VALID = /^[a-f0-9]{32}$/;

// Each visitor gets a private workspace, tied to a random cookie. Their policy and runs
// are theirs alone, so one visitor can never read, change or clear another's.
export async function workspace(): Promise<string> {
  const jar = await cookies();
  const current = jar.get(COOKIE)?.value;
  if (current && VALID.test(current)) return current;

  const id = randomBytes(16).toString("hex");
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
