import { readJson, writeJson } from "./storage";

export type Policy = {
  text: string; // plain-language policy, shown to the model and to Reppo
  limit: number; // spending limit in USD (Kite limit)
  vendors: string[]; // approved vendor list
  pos: string[]; // known PO numbers
};

export const DEFAULT_POLICY: Policy = {
  text:
    "Approve the payment only if the amount is under the user-set limit, " +
    "the invoice number matches a known PO, and the vendor is on the approved list. " +
    "Otherwise deny and give the exact reason.",
  limit: Number(process.env.KITE_STUB_LIMIT ?? 500),
  vendors: ["Acme Supplies", "Globex Ltd", "Initech"],
  pos: ["PO-1001", "PO-1002", "PO-1003"],
};

export const getPolicy = (): Policy => ({ ...DEFAULT_POLICY, ...readJson<Partial<Policy>>("policy.json", {}) });

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

export function savePolicy(input: Partial<Policy>): Policy {
  const cur = getPolicy();
  const limit = Number(input.limit);
  const next: Policy = {
    text: typeof input.text === "string" && input.text.trim() ? input.text.trim() : cur.text,
    limit: Number.isFinite(limit) && limit > 0 ? limit : cur.limit,
    vendors: input.vendors ? list(input.vendors) : cur.vendors,
    pos: input.pos ? list(input.pos).map((p) => p.toUpperCase()) : cur.pos,
  };
  writeJson("policy.json", next);
  return next;
}
