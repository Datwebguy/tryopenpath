import { readJson, writeJson } from "./storage";
import type { Case, EvalResult, Run } from "./types";

const load = () => readJson<Run[]>("history.json", []);
const save = (runs: Run[]) => writeJson("history.json", runs);

export const caseKey = (c: Case) =>
  [c.vendor.trim().toLowerCase(), c.invoiceNumber.trim().toUpperCase(), c.amount].join("|");

export function addRun(run: Run) {
  const runs = load();
  runs.push(run);
  save(runs);
}

// Attach a settled Reppo result to the run that submitted it.
export function setEval(evalId: string, result: EvalResult) {
  const runs = load();
  const run = runs.find((r) => r.evalId === evalId);
  if (!run) return;
  run.eval = result;
  save(runs);
}

export const allRuns = () => load().reverse();

// Most recent run of this case whose Reppo score has settled.
export const latestScored = (key: string) =>
  load()
    .reverse()
    .find((r) => r.caseKey === key && r.eval?.status === "SETTLED");
