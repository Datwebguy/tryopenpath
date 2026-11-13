import type { Policy } from "./policy";
import type { Case, Step } from "./types";

// Hard rules. These run as plain code, never as a model call.
export function runCodeChecks(c: Case, policy: Policy): Step[] {
  const limit = policy.limit;
  const steps: Step[] = [];

  const fieldsOk = Number.isFinite(c.amount) && c.amount > 0 && !!c.vendor && !!c.invoiceNumber;
  steps.push({ step: "parse_case", type: "code", result: fieldsOk ? "ok" : "failed" });

  // The spending limit you set in the policy. Kite Passport limits are checked separately.
  const underLimit = c.amount <= limit;
  steps.push({
    step: "policy_spending_limit",
    type: "code",
    result: underLimit ? "passed" : "failed",
    detail: `amount ${c.amount} vs policy limit ${limit}`,
  });

  const poKnown = policy.pos.includes(c.invoiceNumber.trim().toUpperCase());
  steps.push({ step: "po_match", type: "code", result: poKnown ? "passed" : "failed" });

  const vendorOk = policy.vendors.some((v) => v.toLowerCase() === c.vendor.trim().toLowerCase());
  steps.push({ step: "vendor_allowlist", type: "code", result: vendorOk ? "passed" : "failed" });

  return steps;
}
