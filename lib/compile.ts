import { randomUUID } from "node:crypto";
import { FIELD_HELP, validateRule, type Rule } from "./rules";
import { firstJson, servChat, type ChatMessage } from "./serv";

const SYSTEM_PROMPT = `You turn one plain-language business rule into a structured rule for an invoice review tool.
Respond with JSON only.

Fields you may use:
- "amount": number, the invoice amount in USD
- "vendor": text
- "invoiceNumber": text, the PO number
- "notes": text, the free-text notes
- "weekday": text, the lowercase day name when the case is run, such as "saturday"
- "earlierRuns": number, how many earlier runs exist for the same vendor

Operators: for numbers use gt, gte, lt, lte, eq, neq. For text use eq, neq, contains, notcontains, startswith, endswith, in, notin ("in" and "notin" take an array of text).

Answer in this shape:
{"label": "<a name of 2 to 5 words>", "then": "deny" or "escalate", "reason": "<one plain sentence shown when the rule triggers>", "match": "all" or "any", "conditions": [{"field": "<field>", "op": "<operator>", "value": <value>}, ...]}

"match" is "all" when every condition must be true, and "any" when one is enough.
Use "deny" when the sentence says to reject, block or deny. Use "escalate" when it says to flag, review, check, or send to a person.

Phrases: "a new vendor" or "a vendor we have not used before" means earlierRuns eq 0. "A repeat vendor" means earlierRuns gt 0. "On a weekend" means weekday in ["saturday","sunday"]. To catch several words in the notes, use match "any" with one contains condition per word.

Examples
Sentence: "Send anything over 500 dollars on a Sunday to a person"
Answer: {"label":"Large Sunday invoice","then":"escalate","reason":"Large invoices run on a Sunday need a person to look at them.","match":"all","conditions":[{"field":"amount","op":"gt","value":500},{"field":"weekday","op":"eq","value":"sunday"}]}
Sentence: "Deny it if the notes mention gift cards or crypto"
Answer: {"label":"Risky payment words","then":"deny","reason":"The notes mention a payment method this policy does not allow.","match":"any","conditions":[{"field":"notes","op":"contains","value":"gift card"},{"field":"notes","op":"contains","value":"crypto"}]}

If the sentence needs information that is not in the fields above, answer {"error": "<one friendly sentence saying what the rule needs>"}.`;

// ---------- tolerate the common ways a model words the same rule ----------

const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const FIELDS: Record<string, string> = {
  amount: "amount", total: "amount", invoiceamount: "amount",
  vendor: "vendor", vendorname: "vendor", supplier: "vendor",
  invoicenumber: "invoiceNumber", ponumber: "invoiceNumber", po: "invoiceNumber", invoice: "invoiceNumber",
  notes: "notes", note: "notes", memo: "notes",
  weekday: "weekday", dayofweek: "weekday", day: "weekday",
  earlierruns: "earlierRuns", priorvendorruns: "earlierRuns", previousruns: "earlierRuns", vendorruncount: "earlierRuns", vendorhistory: "earlierRuns",
};
const OPS: Record<string, string> = {
  gt: "gt", greaterthan: "gt", gte: "gte", greaterthanorequal: "gte", greaterthanorequals: "gte",
  lt: "lt", lessthan: "lt", lte: "lte", lessthanorequal: "lte", lessthanorequals: "lte",
  eq: "eq", equals: "eq", equal: "eq", is: "eq", neq: "neq", notequals: "neq", notequal: "neq", isnot: "neq",
  contains: "contains", includes: "contains", notcontains: "notcontains", doesnotcontain: "notcontains", doesnotinclude: "notcontains",
  startswith: "startswith", beginswith: "startswith", endswith: "endswith",
  in: "in", oneof: "in", notin: "notin", noneof: "notin",
};
const THEN: Record<string, string> = { deny: "deny", reject: "deny", block: "deny", denied: "deny", escalate: "escalate", flag: "escalate", review: "escalate", escalated: "escalate" };

// Exact names first, then sensible guesses for names a model invents.
function fieldFor(name: unknown): string | undefined {
  const k = squash(String(name));
  if (FIELDS[k]) return FIELDS[k];
  if (k.includes("vendor") && /(run|histor|prior|previous|earlier|count|times)/.test(k)) return "earlierRuns";
  if (/(ponum|invoicenum|^po)/.test(k)) return "invoiceNumber";
  if (/(weekday|dayofweek)/.test(k)) return "weekday";
  return undefined;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

// "a new vendor" / "a repeat vendor" are about earlier runs. Models word it in many ways, so translate them.
const NEW_WORDS = /^(new|first|firsttime|none|never|unused|zero|isnew|neverused|notused)/;
const REPEAT_WORDS = /^(repeat|return|exist|known|prior|previous|used|isrepeat|isknown|returning|existing)/;

function vendorHistory(field: unknown, rawOp: unknown, op: unknown, value: unknown): unknown {
  const plain = { field, op, value };
  const asWord = (v: unknown) => squash(String(v));
  if (field === "earlierRuns" && typeof value === "string" && Number.isNaN(Number(value))) {
    if (NEW_WORDS.test(asWord(value))) return { field, op: "eq", value: 0 };
    if (REPEAT_WORDS.test(asWord(value))) return { field, op: "gt", value: 0 };
  }
  if (field === "vendor") {
    const w = asWord(rawOp);
    const flip = value === false || asWord(value) === "false";
    if (NEW_WORDS.test(w)) return flip ? { field: "earlierRuns", op: "gt", value: 0 } : { field: "earlierRuns", op: "eq", value: 0 };
    if (REPEAT_WORDS.test(w)) return flip ? { field: "earlierRuns", op: "eq", value: 0 } : { field: "earlierRuns", op: "gt", value: 0 };
  }
  return plain;
}

// One condition, in whatever shape the model used, into { field, op, value } | { all|any|not }.
function toCond(node: unknown): unknown {
  if (Array.isArray(node)) return { all: node.map(toCond) };
  if (!isObj(node)) return node;

  // and / or / all / any with a list, or { operator: "and", operands: [...] }
  for (const [word, key] of [["and", "all"], ["all", "all"], ["or", "any"], ["any", "any"]] as const) {
    if (Array.isArray(node[word])) return { [key]: (node[word] as unknown[]).map(toCond) };
  }
  if (Array.isArray(node.operands) && typeof node.operator === "string") {
    const key = squash(node.operator) === "or" ? "any" : "all";
    return { [key]: node.operands.map(toCond) };
  }
  if ("not" in node) return { not: toCond(node.not) };

  // { field, op | operator, value }
  if ("field" in node) {
    const field = fieldFor(node.field) ?? node.field;
    const rawOp = node.op ?? node.operator ?? "eq";
    const op = OPS[squash(String(rawOp))] ?? rawOp;
    return vendorHistory(field, rawOp, op, node.value);
  }

  // { notes: { contains: "urgent" } }  or  { weekday: "Saturday" }  or  { contains: { field, value } }
  const keys = Object.keys(node);
  if (keys.length === 1) {
    const k = keys[0];
    const v = node[k];
    if (OPS[squash(k)] && isObj(v) && "field" in v) return toCond({ ...v, op: OPS[squash(k)] });
    if (fieldFor(k)) {
      if (isObj(v)) {
        const [ok, ov] = Object.entries(v)[0] ?? [];
        return { field: fieldFor(k), op: OPS[squash(String(ok))] ?? ok, value: ov };
      }
      return { field: fieldFor(k), op: "eq", value: v };
    }
  }
  return node;
}

const JUNK = /^(redacted|label|rule|untitled|name|n\/a|none)$/i;

// A short readable name: tidy what SERV gave, or build one from the sentence.
function cleanLabel(label: unknown, text: string) {
  let l = typeof label === "string" ? label.replace(/[_-]+/g, " ").trim() : "";
  if (!l || JUNK.test(l) || l.length < 3) l = text.split(/\s+/).slice(0, 5).join(" ");
  l = l.slice(0, 48);
  return l.charAt(0).toUpperCase() + l.slice(1);
}

function cleanReason(reason: unknown, text: string) {
  const r = typeof reason === "string" ? reason.trim() : "";
  return !r || JUNK.test(r) ? `This case matched your rule: ${text}` : r;
}

function toRule(raw: Obj, text: string): Rule | null {
  const then = THEN[squash(String(raw.then ?? raw.action ?? raw.outcome ?? ""))];
  const listed = raw.conditions ?? raw.condition ?? raw.when;
  let when: unknown;
  if (Array.isArray(listed)) when = { [squash(String(raw.match ?? "all")) === "any" ? "any" : "all"]: listed.map(toCond) };
  else when = toCond(listed);

  return validateRule({
    id: randomUUID().replace(/-/g, "").slice(0, 8),
    text,
    label: cleanLabel(raw.label ?? raw.name ?? raw.title, text),
    when,
    then,
    reason: cleanReason(raw.reason ?? raw.message, text),
  });
}

// ---------- ask SERV ----------

type Attempt = { rule?: Rule; error?: string; answer: string };

async function ask(messages: ChatMessage[], text: string): Promise<Attempt> {
  // Writing a rule happens once, so it can use a stronger SERV model than the per-case judgment.
  const { text: answer } = await servChat(messages, process.env.SERV_RULES_MODEL);
  if (process.env.OPENPATH_DEBUG) console.error("compile answer:", answer);

  let raw: Obj;
  try {
    raw = firstJson<Obj>(answer);
  } catch {
    return { answer };
  }
  if (typeof raw.error === "string") return { error: `${raw.error} Rules can use ${FIELD_HELP}.`, answer };
  const rule = toRule(raw, text);
  return rule ? { rule, answer } : { answer };
}

// Only the rule or a plain message ever leaves the server, never SERV's raw answer.
const outcome = (a: Attempt): { rule?: Rule; error?: string } => (a.rule ? { rule: a.rule } : { error: a.error });

export async function compileRule(sentence: string): Promise<{ rule?: Rule; error?: string }> {
  const text = sentence.trim().slice(0, 500);
  if (!text) return { error: "Write the rule in a sentence first." };

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: text },
  ];
  const first = await ask(messages, text);
  if (first.rule || first.error) return outcome(first);

  // The answer was not a complete rule. Ask once more, saying exactly what is needed.
  const second = await ask(
    [
      ...messages,
      { role: "assistant", content: first.answer },
      {
        role: "user",
        content:
          'That answer was not a complete rule. Answer again with JSON only, in exactly the shape from the instructions: label, then, reason, match, and a conditions list where every condition has field, op and value, using only the listed fields and operators.',
      },
    ],
    text,
  );
  if (second.rule || second.error) return outcome(second);

  // SERV varies from one answer to the next, so one fresh attempt is worth making before giving up.
  const third = await ask(messages, text);
  if (third.rule || third.error) return outcome(third);
  return { error: `SERV's answer was not a complete rule. Try rewording it using ${FIELD_HELP}.` };
}
