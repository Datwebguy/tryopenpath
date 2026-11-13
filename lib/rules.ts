// Plain-language rules, compiled by SERV Reasoning into a small, exact structure.
// Rules are data, never code: this file validates them and evaluates them safely.

export type Field = "amount" | "vendor" | "invoiceNumber" | "notes" | "weekday" | "earlierRuns";
export type Op = "gt" | "gte" | "lt" | "lte" | "eq" | "neq" | "in" | "notin" | "contains" | "notcontains" | "startswith" | "endswith";

export type Cond =
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond }
  | { field: Field; op: Op; value: string | number | string[] };

export type Rule = {
  id: string;
  text: string; // the sentence the user wrote
  label: string; // short name shown in the path
  when: Cond;
  then: "deny" | "escalate";
  reason: string; // shown when the rule triggers
};

export type RuleContext = {
  amount: number;
  vendor: string;
  invoiceNumber: string;
  notes: string;
  weekday: string; // lowercase day name when the case is run
  earlierRuns: number; // earlier runs for the same vendor
};

const KIND: Record<Field, "number" | "text"> = {
  amount: "number",
  earlierRuns: "number",
  vendor: "text",
  invoiceNumber: "text",
  notes: "text",
  weekday: "text",
};
const NUMBER_OPS: Op[] = ["gt", "gte", "lt", "lte", "eq", "neq"];
const TEXT_OPS: Op[] = ["eq", "neq", "contains", "notcontains", "in", "notin", "startswith", "endswith"];

export const FIELD_HELP =
  "the amount, the vendor, the PO number, the notes, the day of the week, or the number of earlier runs for the vendor";

const MAX_DEPTH = 4;
const MAX_RULES = 10;

function validateCond(c: unknown, depth = 0): Cond | null {
  if (!c || typeof c !== "object" || depth > MAX_DEPTH) return null;
  const o = c as Record<string, unknown>;

  for (const key of ["all", "any"] as const) {
    if (Array.isArray(o[key])) {
      const parts = (o[key] as unknown[]).map((p) => validateCond(p, depth + 1));
      if (parts.length === 0 || parts.length > 8 || parts.some((p) => p === null)) return null;
      return { [key]: parts as Cond[] } as Cond;
    }
  }
  if ("not" in o) {
    const inner = validateCond(o.not, depth + 1);
    return inner ? { not: inner } : null;
  }

  const field = o.field as Field;
  const op = o.op as Op;
  // Exact names only. The `in` operator would also accept inherited names such as "constructor".
  if (!Object.prototype.hasOwnProperty.call(KIND, field)) return null;
  if (!(KIND[field] === "number" ? NUMBER_OPS : TEXT_OPS).includes(op)) return null;

  if (KIND[field] === "number") {
    const n = Number(o.value);
    return Number.isFinite(n) && typeof o.value !== "boolean" && o.value !== "" ? { field, op, value: n } : null;
  }
  if (op === "in" || op === "notin") {
    if (!Array.isArray(o.value) || o.value.length === 0 || o.value.length > 50) return null;
    const list = o.value.map((v) => String(v).trim()).filter(Boolean);
    return list.length ? { field, op, value: list } : null;
  }
  return typeof o.value === "string" && o.value.trim() ? { field, op, value: o.value.trim() } : null;
}

export function validateRule(raw: unknown): Rule | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const when = validateCond(r.when);
  if (!when || (r.then !== "deny" && r.then !== "escalate")) return null;
  const label = typeof r.label === "string" ? r.label.trim().slice(0, 60) : "";
  const reason = typeof r.reason === "string" ? r.reason.trim().slice(0, 240) : "";
  const text = typeof r.text === "string" ? r.text.trim().slice(0, 500) : "";
  if (!label || !reason || !text) return null;
  const id = typeof r.id === "string" && /^[a-z0-9]{4,12}$/i.test(r.id) ? r.id : "";
  if (!id) return null;
  return { id, text, label, when, then: r.then, reason };
}

export function validateRules(raw: unknown): { rules?: Rule[]; error?: string } {
  if (raw === undefined) return { rules: [] };
  if (!Array.isArray(raw)) return { error: "Rules must be a list." };
  if (raw.length > MAX_RULES) return { error: `Add up to ${MAX_RULES} rules.` };
  const rules: Rule[] = [];
  for (const r of raw) {
    const v = validateRule(r);
    if (!v) return { error: "One of the rules is not complete. Remove it and add it again." };
    rules.push(v);
  }
  return { rules };
}

// ---------- evaluation ----------

function text(v: unknown) {
  return String(v).toLowerCase();
}

function evalCond(c: Cond, ctx: RuleContext): boolean {
  if ("all" in c) return c.all.every((p) => evalCond(p, ctx));
  if ("any" in c) return c.any.some((p) => evalCond(p, ctx));
  if ("not" in c) return !evalCond(c.not, ctx);

  const actual = ctx[c.field];
  if (KIND[c.field] === "number") {
    const a = Number(actual);
    const v = Number(c.value);
    switch (c.op) {
      case "gt": return a > v;
      case "gte": return a >= v;
      case "lt": return a < v;
      case "lte": return a <= v;
      case "eq": return a === v;
      case "neq": return a !== v;
      default: return false;
    }
  }
  const a = text(actual);
  const v = Array.isArray(c.value) ? c.value.map(text) : [text(c.value)];
  switch (c.op) {
    case "eq": return a === v[0];
    case "neq": return a !== v[0];
    case "startswith": return a.startsWith(v[0]);
    case "endswith": return a.endsWith(v[0]);
    case "contains": return a.includes(v[0]);
    case "notcontains": return !a.includes(v[0]);
    case "in": return v.includes(a);
    case "notin": return !v.includes(a);
    default: return false;
  }
}

export const ruleMatches = (rule: Rule, ctx: RuleContext) => evalCond(rule.when, ctx);

// ---------- readable description ----------

const FIELD_WORDS: Record<Field, string> = {
  amount: "the amount",
  vendor: "the vendor",
  invoiceNumber: "the PO number",
  notes: "the notes",
  weekday: "the day of the week",
  earlierRuns: "earlier runs for this vendor",
};
const OP_WORDS: Record<Op, string> = {
  gt: "is over",
  gte: "is at least",
  lt: "is under",
  lte: "is at most",
  eq: "is",
  neq: "is not",
  in: "is one of",
  notin: "is not one of",
  contains: "mention",
  notcontains: "do not mention",
  startswith: "starts with",
  endswith: "ends with",
};

const usd = (n: unknown) => `$${Number(n).toLocaleString("en-US")}`;

// ["Saturday", "Sunday"] -> "Saturday or Sunday"
const orList = (v: string[]) => (v.length <= 1 ? (v[0] ?? "") : `${v.slice(0, -1).join(", ")} or ${v[v.length - 1]}`);

function describeRuns(op: Op, n: number): string {
  if (op === "eq" && n === 0) return "the vendor is new";
  if ((op === "gt" && n === 0) || (op === "gte" && n === 1)) return "the vendor has run before";
  const words: Partial<Record<Op, string>> = { gt: "more than", gte: "at least", lt: "fewer than", lte: "at most", eq: "exactly", neq: "not exactly" };
  return `the vendor has ${words[op] ?? "about"} ${n} earlier run${n === 1 ? "" : "s"}`;
}

export function describeCond(c: Cond, top = true): string {
  if ("all" in c) return wrap(c.all.map((p) => describeCond(p, false)).join(" and "), top);
  if ("any" in c) return wrap(c.any.map((p) => describeCond(p, false)).join(" or "), top);
  if ("not" in c) return `not (${describeCond(c.not, true)})`;
  if (c.field === "earlierRuns") return describeRuns(c.op, Number(c.value));

  const val = Array.isArray(c.value) ? orList(c.value) : c.field === "amount" ? usd(c.value) : String(c.value);
  const notes = c.field === "notes";
  // "the notes mention urgent" reads better than "the notes contains urgent"
  const opWord =
    notes && c.op === "contains" ? "mention"
    : notes && c.op === "notcontains" ? "do not mention"
    : c.op === "contains" ? "includes"
    : c.op === "notcontains" ? "does not include"
    : OP_WORDS[c.op];
  return `${FIELD_WORDS[c.field]} ${opWord} ${val}`;
}
const wrap = (s: string, top: boolean) => (top ? s : `(${s})`);

export const describeRule = (r: Rule) =>
  `When ${describeCond(r.when)}, ${r.then === "deny" ? "deny the case" : "send it to a person"}.`;
