import { readJson, wsFile, writeJson } from "./storage";
import type { EvalResult, Run } from "./types";

const MAX_RUNS = 100; // per workspace, oldest first out
const SHARE_ID = /^[a-f0-9]{10}$/;

const runsFile = (ws: string) => wsFile(ws, "history.json");
const load = (ws: string) => readJson<Run[]>(runsFile(ws), []);
const save = (ws: string, runs: Run[]) => writeJson(runsFile(ws), runs);

// Shared links need to find a run without knowing whose workspace it is in.
type Shares = Record<string, string>; // run id -> workspace
const loadShares = () => readJson<Shares>("shares.json", {});

export function addRun(ws: string, run: Run) {
  let runs = load(ws);
  runs.push(run);
  const shares = loadShares();
  shares[run.id] = ws;
  if (runs.length > MAX_RUNS) {
    for (const old of runs.slice(0, runs.length - MAX_RUNS)) delete shares[old.id];
    runs = runs.slice(-MAX_RUNS);
  }
  save(ws, runs);
  writeJson("shares.json", shares);
}

export function updateRun(ws: string, id: string, patch: Partial<Run>) {
  const runs = load(ws);
  const run = runs.find((r) => r.id === id);
  if (!run) return;
  Object.assign(run, patch);
  save(ws, runs);
}

export const setEval = (ws: string, id: string, result: EvalResult) => updateRun(ws, id, { eval: result });

export const findRunIn = (ws: string, id: string) => load(ws).find((r) => r.id === id);
export const findRunByEval = (ws: string, evalId: string) => load(ws).find((r) => r.evalId === evalId);

// A run opened through its share link. Returns the run and the workspace it lives in.
export function findSharedRun(id: string): { run: Run; ws: string } | null {
  if (!SHARE_ID.test(id)) return null;
  const ws = loadShares()[id];
  if (!ws) return null;
  const run = findRunIn(ws, id);
  return run ? { run, ws } : null;
}

export const vendorRunCount = (ws: string, vendor: string) =>
  load(ws).filter((r) => r.case.vendor.trim().toLowerCase() === vendor.trim().toLowerCase()).length;

export function clearRuns(ws: string) {
  const runs = load(ws);
  const shares = loadShares();
  for (const r of runs) delete shares[r.id];
  writeJson("shares.json", shares);
  save(ws, []);
  return runs.length;
}

export const allRuns = (ws: string) => load(ws).reverse();

// Most recent run of this case whose Reppo score has settled.
export const latestScored = (ws: string, key: string) =>
  load(ws)
    .reverse()
    .find((r) => r.caseKey === key && r.eval?.status === "SETTLED");
