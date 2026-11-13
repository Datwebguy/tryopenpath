import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Case, EvalResult, Run } from "./types";

// File-backed demo history, so stored feedback survives restarts.
// Set OPENPATH_DATA_DIR to change where it lives. On read-only or serverless
// hosts the system temp dir is used, which lasts only as long as the instance.
const dir =
  process.env.OPENPATH_DATA_DIR ??
  (process.env.VERCEL ? path.join(os.tmpdir(), "openpath") : path.join(process.cwd(), ".data"));
const file = path.join(dir, "history.json");

function load(): Run[] {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Run[];
  } catch {
    return [];
  }
}

function save(runs: Run[]) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(runs, null, 2));
  } catch (e) {
    console.error("Could not save history:", e);
  }
}

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
