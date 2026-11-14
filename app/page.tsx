"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { caseKey } from "@/lib/case";
import type { Policy } from "@/lib/policy";
import type { Case, Decision, EvalResult, Run } from "@/lib/types";
import CaseForm, { type Draft } from "./components/CaseForm";
import History from "./components/History";
import { AlertIcon, RepeatIcon } from "./components/Icons";
import DecisionCard from "./components/DecisionCard";
import Trend from "./components/Trend";
import Integrations, { type Status } from "./components/Integrations";
import Logo from "./components/Logo";
import PathGraph, { PathSkeleton } from "./components/PathGraph";
import PolicyCard from "./components/PolicyCard";
import ScoreCard from "./components/ScoreCard";
import Stepper from "./components/Stepper";
import Intro from "./components/Intro";
import Showcase from "./components/Showcase";

const emptyDraft: Draft = { amount: "", vendor: "", invoiceNumber: "", notes: "", bankAccount: "" };

const toCase = (d: Draft): Case => ({
  amount: Number(d.amount),
  vendor: d.vendor.trim(),
  invoiceNumber: d.invoiceNumber.trim(),
  notes: d.notes.trim(),
  ...(d.bankAccount.trim() ? { bankAccount: d.bankAccount.trim() } : {}),
});

export default function Home() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [history, setHistory] = useState<Run[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Decision | null>(null);
  const [current, setCurrent] = useState<Case | null>(null);
  const [activeAt, setActiveAt] = useState<string | undefined>();
  const [runError, setRunError] = useState<string | null>(null);
  const [evalId, setEvalId] = useState<string | null>(null);
  const [evalState, setEvalState] = useState<EvalResult | null>(null);
  const [evalMsg, setEvalMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasShowcase, setHasShowcase] = useState(false);
  const onShowcase = useCallback((has: boolean) => setHasShowcase(has), []);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    const h: Run[] = await (await fetch("/api/history")).json();
    setHistory(h);
    return h;
  }, []);

  useEffect(() => {
    fetch("/api/policy").then((r) => r.json()).then((p) => { setPolicy(p); setLoaded(true); });
    fetch("/api/status").then((r) => r.json()).then(setStatus);
    loadHistory();
  }, [loadHistory]);

  // Poll Reppo until the evaluation settles.
  useEffect(() => {
    if (!evalId || evalState?.status === "SETTLED" || evalState?.status === "FAILED") return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      const r = await (await fetch(`/api/evaluate/${evalId}`)).json();
      if (stop) return;
      if (r.error) return setEvalMsg(r.error);
      setEvalState(r);
      if (r.status === "PENDING") timer = setTimeout(poll, 5000);
      else loadHistory();
    }
    poll();
    return () => { stop = true; clearTimeout(timer); };
  }, [evalId, evalState?.status, loadHistory]);

  // Seconds since scoring began.
  useEffect(() => {
    if (!evalId || evalState?.status === "SETTLED" || evalState?.status === "FAILED") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [evalId, evalState?.status]);

  async function savePolicy(p: Policy): Promise<string | null> {
    const res = await fetch("/api/policy", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    const body = await res.json();
    if (!res.ok) return body.error ?? "Could not save the policy.";
    setPolicy(body);
    return null;
  }

  async function run(c: Case) {
    setRunning(true);
    setRunError(null);
    setResult(null);
    setEvalId(null);
    setEvalState(null);
    setEvalMsg(null);
    setCurrent(c);
    setActiveAt(undefined);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const res = await fetch("/api/decide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
    const body = await res.json();
    if (!res.ok) {
      setRunning(false);
      setRunError(body.error ?? "Something went wrong. Please try again.");
      return;
    }
    const decision: Decision = body;
    setResult(decision);
    setRunning(false);

    // The server saved this run. Ask for it to be scored by its id.
    const h = await loadHistory();
    setActiveAt(h[0]?.at);
    try {
      const ev = await (await fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: decision.runId }) })).json();
      if (ev.error) setEvalMsg(ev.error);
      else setEvalId(ev.evalId);
    } catch {
      setEvalMsg("Scoring did not start just now. Run the case again to score it.");
    }
    await loadHistory();
  }

  async function clearHistory() {
    await fetch("/api/history", { method: "DELETE" });
    setHistory([]);
    setActiveAt(undefined);
    setResult(null);
    setCurrent(null);
    setEvalId(null);
    setEvalState(null);
    setEvalMsg(null);
  }

  async function resetPolicy() {
    await fetch("/api/policy", { method: "DELETE" });
    setPolicy(null);
    setResult(null);
    setCurrent(null);
    setEvalId(null);
    setEvalState(null);
    setDraft(emptyDraft);
  }

  function openRun(r: Run) {
    setCurrent(r.case);
    setDraft({ amount: String(r.case.amount), vendor: r.case.vendor, invoiceNumber: r.case.invoiceNumber, notes: r.case.notes, bankAccount: r.case.bankAccount ?? "" });
    setResult(r.decision);
    setActiveAt(r.at);
    setEvalMsg(null);
    setEvalState(r.eval ?? null);
    setEvalId(r.evalId ?? null);
    setRunError(null);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const key = current ? caseKey(current) : null;
  const previous = key && activeAt
    ? history.find((r) => r.caseKey === key && r.at < activeAt && r.eval?.status === "SETTLED")?.eval?.score
    : undefined;

  const trend = key
    ? history
        .filter((r) => r.caseKey === key && r.eval?.status === "SETTLED" && r.eval.score !== undefined)
        .map((r) => ({ score: r.eval!.score as number, at: r.at }))
        .sort((x, y) => x.at.localeCompare(y.at))
    : [];

  async function share() {
    const id = history.find((r) => r.at === activeAt)?.id;
    if (!id) return;
    const url = `${window.location.origin}/run/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  const settled = evalState?.status === "SETTLED";
  const done = !policy ? 0 : !result ? 1 : settled ? (previous !== undefined ? 5 : 4) : 3;

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <div className="brand"><Logo /><span>Openpath</span></div>
          <Integrations status={status} />
        </div>
      </header>

      <main className="wrap">
        <Intro hasShowcase={hasShowcase} />
        <Showcase onLoaded={onShowcase} />

        <section className="hero" id="try">
          <h2>Try it yourself</h2>
          <p>Write a policy, add a rule in your own words, and run a case. Every step shows up live.</p>
          <Stepper done={done} />
        </section>

        <div className="layout">
          <div className="col">
            {loaded && <PolicyCard key={policy ? "set" : "new"} policy={policy} onSave={savePolicy} onReset={resetPolicy} />}
            {policy && (
              <CaseForm policy={policy} draft={draft} onChange={setDraft} loading={running} onRun={() => run(toCase(draft))} />
            )}
          </div>

          <div className="col" ref={resultsRef}>
            {runError && <p className="notice err" role="alert"><AlertIcon width={16} height={16} /> {runError}</p>}

            {running && (
              <section className="card">
                <header className="card-head tight"><div><h2>Checking the case</h2><p className="sub">Fixed rules first, then the AI judgment.</p></div></header>
                <PathSkeleton />
              </section>
            )}

            {result && !running && (
              <>
                <DecisionCard result={result} />

                <section className="card rise">
                  <header className="card-head tight"><div><h2>Decision path</h2><p className="sub">Each step, who ran it, and what it found.</p></div></header>
                  <PathGraph path={result.path} ms={result.ms} />
                </section>

                <ScoreCard evalId={evalId} state={evalState} message={evalMsg} previous={previous} elapsed={elapsed} />

                <Trend points={trend} />

                {current && (
                  <div className="actions">
                    <button className="btn secondary lg rerun" onClick={() => run(current)} disabled={running}>
                      <RepeatIcon width={17} height={17} /> Run again with feedback
                    </button>
                    <button className="btn ghost lg" onClick={share} disabled={!activeAt}>
                      {copied ? "Link copied" : "Share this run"}
                    </button>
                  </div>
                )}
              </>
            )}

            {!result && !running && !runError && (
              <section className="card empty">
                <svg viewBox="0 0 220 120" width="220" height="120" aria-hidden>
                  <path d="M20 90 H80 V30 H140 V60 H200" fill="none" stroke="#c7d2fe" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 8" />
                  <circle cx="20" cy="90" r="9" fill="#4338ca" /><circle cx="80" cy="30" r="9" fill="#818cf8" /><circle cx="140" cy="60" r="9" fill="#a5b4fc" /><circle cx="200" cy="60" r="9" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="3" />
                </svg>
                <h2>{policy ? "Your decision path will appear here" : "Start with a policy"}</h2>
                <p className="sub">{policy ? "Run a case and every step shows up live: the rule checks, the AI judgment, and the score." : "Save your rules on the left. Then every case you run is checked against them."}</p>
              </section>
            )}

            <History runs={history} activeAt={activeAt} onSelect={openRun} onClear={clearHistory} />
          </div>
        </div>
      </main>

      <footer className="foot wrap">Openpath · Fixed rules, AI judgment, every step on record.</footer>
    </>
  );
}
