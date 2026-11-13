import { NextResponse } from "next/server";
import type { Case } from "./types";

// Reads a JSON body, refusing anything larger than `maxBytes`.
export async function readBody(
  req: Request,
  maxBytes: number,
): Promise<{ body: Record<string, unknown>; error?: undefined } | { body?: undefined; error: NextResponse }> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  const tooBig = () => ({ error: NextResponse.json({ error: "That request is too large." }, { status: 413 }) });
  if (declared > maxBytes) return tooBig();
  const text = await req.text();
  if (text.length > maxBytes) return tooBig();
  try {
    const body = JSON.parse(text || "{}");
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
    return { body };
  } catch {
    return { error: NextResponse.json({ error: "That request could not be read." }, { status: 400 }) };
  }
}

// Strips control characters and limits length.
const clean = (v: unknown, max: number) =>
  String(v ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

export function parseCase(body: Record<string, unknown>): { case?: Case; error?: string } {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1e12) return { error: "Enter an amount above 0." };
  const vendor = clean(body.vendor, 120);
  const invoiceNumber = clean(body.invoiceNumber, 60);
  if (!vendor) return { error: "Enter the vendor." };
  if (!invoiceNumber) return { error: "Enter the invoice or PO number." };
  return { case: { amount, vendor, invoiceNumber, notes: clean(body.notes, 2000) } };
}
