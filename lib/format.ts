const ACRONYMS = new Set(["po", "id", "api", "usd", "url"]);

// "po_match" -> "PO match", "policy_spending_limit" -> "Policy spending limit"
export function humanize(s: string) {
  const words = s.replace(/_/g, " ").trim().split(/\s+/).map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w));
  const t = words.join(" ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

export function duration(ms?: number) {
  if (ms === undefined) return "";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

export function ago(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

// Plain-language labels for what a person sees. The stored data keeps its short ids.
const STEP_LABELS: Record<string, string> = {
  parse_case: "Read the case",
  policy_spending_limit: "Spending limit",
  po_match: "PO number",
  vendor_allowlist: "Approved vendor",
  kite_identity: "Kite identity",
  kite_session_limit: "Kite session limit",
  load_feedback: "Past feedback",
  model_judgment: "AI judgment",
};
export const stepLabel = (id: string) => STEP_LABELS[id] ?? humanize(id);

const RESULT_LABELS: Record<string, string> = { ok: "Done", passed: "Passed", failed: "Failed", skipped: "Skipped" };
export const resultLabel = (r: string) => RESULT_LABELS[r] ?? cap(r);

const ROUTE_LABELS: Record<string, string> = { ship: "Ready to use", review: "Worth a review", block: "Hold back" };
export const routeLabel = (r: string) => ROUTE_LABELS[r] ?? cap(r);

const VERDICT_LABELS: Record<string, string> = { accept: "Accepted", reject: "Rejected" };
export const verdictLabel = (v: string) => VERDICT_LABELS[v] ?? cap(v);

const PROVIDER_NAMES: Record<string, string> = { serv: "SERV Reasoning" };
// "serv (serv-mini)" -> "SERV Reasoning · serv-mini"
export function providerLabel(p: string) {
  const m = p.match(/^(\w+) \((.+)\)$/);
  if (!m) return p;
  return `${PROVIDER_NAMES[m[1]] ?? m[1]} · ${m[2]}`;
}
