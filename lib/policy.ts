import { validateRules, type Rule } from "./rules";
import { readJson, writeJson } from "./storage";

export type Policy = {
  text: string; // plain-language policy, shown to the model and to Reppo
  limit: number; // spending limit in USD (Kite limit)
  vendors: string[]; // approved vendor list
  pos: string[]; // known PO numbers
  rules: Rule[]; // your own rules, written in plain words and compiled by SERV
};

// No built-in policy. It exists only once the user has saved one.
export function getPolicy(): Policy | null {
  const p = readJson<Partial<Policy> | null>("policy.json", null);
  return p ? ({ rules: [], vendors: [], pos: [], ...p } as Policy) : null;
}

export function clearPolicy() {
  writeJson("policy.json", null);
}

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

export function savePolicy(input: Partial<Policy>): { policy?: Policy; error?: string } {
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const limit = Number(input.limit);
  if (!text) return { error: "Policy text is required" };
  if (!Number.isFinite(limit) || limit <= 0) return { error: "Spending limit must be above 0" };
  const checked = validateRules(input.rules);
  if (checked.error) return { error: checked.error };
  const policy: Policy = {
    text,
    limit,
    rules: checked.rules ?? [],
    vendors: list(input.vendors),
    pos: list(input.pos).map((p) => p.toUpperCase()),
  };
  writeJson("policy.json", policy);
  return { policy };
}
