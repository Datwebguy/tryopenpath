import type { Case, Run } from "./types";

// In-memory demo history. It resets when the server restarts.
const g = globalThis as unknown as { __openpathRuns?: Run[] };
const runs = (g.__openpathRuns ??= []);

export const caseKey = (c: Case) =>
  [c.vendor.trim().toLowerCase(), c.invoiceNumber.trim().toUpperCase(), c.amount].join("|");

export const addRun = (run: Run) => void runs.push(run);

export const findRunByEval = (evalId: string) => runs.find((r) => r.evalId === evalId);

export const runsForCase = (key: string) => runs.filter((r) => r.caseKey === key);
