import { normAccount } from "./account";
import { validateRules, type Rule } from "./rules";
import { readJson, wsFile, writeJson } from "./storage";

export type Policy = {
  text: string; // plain-language policy, shown to the model and to Reppo
  limit: number; // spending limit in USD
  vendors: string[]; // approved vendor list
  pos: string[]; // known PO numbers
  rules: Rule[]; // your own rules, written in plain words and compiled by SERV
  accounts: VendorAccount[]; // each vendor's known bank account
};

export type VendorAccount = { vendor: string; account: string };

const file = (ws: string) => wsFile(ws, "policy.json");

// No built-in policy. It exists only once the visitor has saved one.
export function getPolicy(ws: string): Policy | null {
  const p = readJson<Partial<Policy> | null>(file(ws), null);
  return p ? ({ rules: [], vendors: [], pos: [], accounts: [], ...p } as Policy) : null;
}

export function clearPolicy(ws: string) {
  writeJson(file(ws), null);
}

const MAX_TEXT = 4000;
const MAX_ITEMS = 200;
const MAX_ITEM_LENGTH = 120;

const accountList = (v: unknown): VendorAccount[] =>
  Array.isArray(v)
    ? v
        .slice(0, MAX_ITEMS)
        .map((x) => ({ vendor: String(x?.vendor ?? "").trim().slice(0, MAX_ITEM_LENGTH), account: String(x?.account ?? "").trim().slice(0, 64) }))
        .filter((x) => x.vendor && normAccount(x.account).length >= 4)
    : [];

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.slice(0, MAX_ITEMS).map((x) => String(x).trim().slice(0, MAX_ITEM_LENGTH)).filter(Boolean) : [];

export function savePolicy(ws: string, input: Partial<Policy>): { policy?: Policy; error?: string } {
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const limit = Number(input.limit);
  if (!text) return { error: "Policy text is required" };
  if (text.length > MAX_TEXT) return { error: `Keep the policy under ${MAX_TEXT} characters.` };
  if (!Number.isFinite(limit) || limit <= 0 || limit > 1e12) return { error: "Spending limit must be above 0" };
  const checked = validateRules(input.rules);
  if (checked.error) return { error: checked.error };
  const policy: Policy = {
    text,
    limit,
    rules: checked.rules ?? [],
    vendors: list(input.vendors),
    pos: list(input.pos).map((p) => p.toUpperCase()),
    accounts: accountList(input.accounts),
  };
  writeJson(file(ws), policy);
  return { policy };
}
