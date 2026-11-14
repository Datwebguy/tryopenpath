import { normAccount } from "./account";
import type { Case } from "./types";

// Identifies "the same case" across runs, so stored feedback can follow it.
export const caseKey = (c: Case) =>
  [c.vendor.trim().toLowerCase(), c.invoiceNumber.trim().toUpperCase(), c.amount, c.bankAccount ? normAccount(c.bankAccount) : ""].join("|");
