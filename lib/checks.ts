import { APPROVED_VENDORS, KNOWN_POS } from "./policy";
import type { Case, Step } from "./types";

// Hard rules. These run as plain code, never as a model call.
export function runCodeChecks(c: Case): Step[] {
  const limit = Number(process.env.KITE_STUB_LIMIT ?? 500);
  const steps: Step[] = [];

  const fieldsOk = Number.isFinite(c.amount) && c.amount > 0 && !!c.vendor && !!c.invoiceNumber;
  steps.push({ step: "parse_case", type: "code", result: fieldsOk ? "ok" : "failed" });

  // Kite stub: spending limit check. Swap for a real Kite Passport check later.
  const underLimit = c.amount <= limit;
  steps.push({
    step: "kite_spending_limit",
    type: "code",
    result: underLimit ? "passed" : "failed",
    detail: `amount ${c.amount} vs limit ${limit} (stubbed Kite check)`,
  });

  const poKnown = KNOWN_POS.includes(c.invoiceNumber.trim().toUpperCase());
  steps.push({ step: "po_match", type: "code", result: poKnown ? "passed" : "failed" });

  const vendorOk = APPROVED_VENDORS.some((v) => v.toLowerCase() === c.vendor.trim().toLowerCase());
  steps.push({ step: "vendor_allowlist", type: "code", result: vendorOk ? "passed" : "failed" });

  return steps;
}
