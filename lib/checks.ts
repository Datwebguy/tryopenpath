import { maskAccount, normAccount } from "./account";
import { money } from "./format";
import type { Policy } from "./policy";
import type { Case, Step } from "./types";

// Hard rules. These run as plain code, never as a model call.
export function runCodeChecks(c: Case, policy: Policy): Step[] {
  const limit = policy.limit;
  const steps: Step[] = [];

  const fieldsOk = Number.isFinite(c.amount) && c.amount > 0 && !!c.vendor && !!c.invoiceNumber;
  steps.push({ step: "parse_case", type: "code", result: fieldsOk ? "ok" : "failed" });

  // The spending limit from the policy.
  const underLimit = c.amount <= limit;
  steps.push({
    step: "policy_spending_limit",
    type: "code",
    result: underLimit ? "passed" : "failed",
    detail: underLimit ? `${money(c.amount)} is within the ${money(limit)} limit` : `${money(c.amount)} is over the ${money(limit)} limit`,
  });

  const poKnown = policy.pos.includes(c.invoiceNumber.trim().toUpperCase());
  steps.push({
    step: "po_match",
    type: "code",
    result: poKnown ? "passed" : "failed",
    detail: poKnown ? `${c.invoiceNumber.trim()} is a known PO` : `${c.invoiceNumber.trim()} is not on the known PO list`,
  });

  const vendorOk = policy.vendors.some((v) => v.toLowerCase() === c.vendor.trim().toLowerCase());
  steps.push({
    step: "vendor_allowlist",
    type: "code",
    result: vendorOk ? "passed" : "failed",
    detail: vendorOk ? `${c.vendor.trim()} is an approved vendor` : `${c.vendor.trim()} is not on the approved vendor list`,
  });

  // Changed bank details are the classic invoice-fraud trick. Compare against the account on file.
  const accounts = policy.accounts ?? [];
  if (c.bankAccount || accounts.length) {
    const vendor = c.vendor.trim();
    const onFile = accounts.find((a) => a.vendor.trim().toLowerCase() === vendor.toLowerCase());
    if (!c.bankAccount) {
      steps.push({ step: "bank_account", type: "code", result: "not given", detail: "This invoice does not say which account it pays to." });
    } else if (!onFile) {
      steps.push({ step: "bank_account", type: "code", result: "not on file", detail: `No account on file for ${vendor} yet. Add one to the policy to catch changed bank details.` });
    } else if (normAccount(onFile.account) === normAccount(c.bankAccount)) {
      steps.push({ step: "bank_account", type: "code", result: "passed", detail: `Pays to the account on file for ${vendor} (${maskAccount(onFile.account)})` });
    } else {
      steps.push({
        step: "bank_account",
        type: "code",
        result: "escalate",
        detail: `Bank details changed. This invoice pays to ${maskAccount(c.bankAccount)}, but the account on file for ${vendor} is ${maskAccount(onFile.account)}. Confirm with the vendor using contact details you already have before paying.`,
      });
    }
  }

  return steps;
}
