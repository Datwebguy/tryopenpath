import { readJson, writeJson } from "./storage";

export type Policy = {
  text: string; // plain-language policy, shown to the model and to Reppo
  limit: number; // spending limit in USD (Kite limit)
  vendors: string[]; // approved vendor list
  pos: string[]; // known PO numbers
};

// No built-in policy. It exists only once the user has saved one.
export const getPolicy = (): Policy | null => readJson<Policy | null>("policy.json", null);

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

export function savePolicy(input: Partial<Policy>): { policy?: Policy; error?: string } {
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const limit = Number(input.limit);
  if (!text) return { error: "Policy text is required" };
  if (!Number.isFinite(limit) || limit <= 0) return { error: "Spending limit must be above 0" };
  const policy: Policy = {
    text,
    limit,
    vendors: list(input.vendors),
    pos: list(input.pos).map((p) => p.toUpperCase()),
  };
  writeJson("policy.json", policy);
  return { policy };
}
