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
