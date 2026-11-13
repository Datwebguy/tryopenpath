"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { EvalResult, Run } from "@/lib/types";
import DecisionCard from "../../components/DecisionCard";
import Logo from "../../components/Logo";
import PathGraph from "../../components/PathGraph";
import ScoreCard from "../../components/ScoreCard";

// A shared, read-only view of one run: its decision, its path and its score.
export default function SharedRun({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<Run | null>(null);
  const [missing, setMissing] = useState(false);
  const [evalState, setEvalState] = useState<EvalResult | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch(`/api/runs/${id}`).then(async (r) => {
      if (!r.ok) return setMissing(true);
      const data: Run = await r.json();
      setRun(data);
      setEvalState(data.eval ?? null);
    });
  }, [id]);

  const evalId = run?.evalId ?? null;
  const done = evalState?.status === "SETTLED" || evalState?.status === "FAILED";

  useEffect(() => {
    if (!evalId || done) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      const r = await (await fetch(`/api/evaluate/${evalId}`)).json();
      if (stop || r.error) return;
      setEvalState(r);
      if (r.status === "PENDING") timer = setTimeout(poll, 5000);
    }
    poll();
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { stop = true; clearTimeout(timer); clearInterval(tick); };
  }, [evalId, done]);

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <Link href="/" className="brand"><Logo /><span>Openpath</span></Link>
          <Link href="/" className="btn secondary sm">Open the console</Link>
        </div>
      </header>
      <main className="wrap share">
        {missing && (
          <section className="card empty">
            <h2>This run is not here</h2>
            <p className="sub">The link may be old, or the run was cleared.</p>
            <Link href="/" className="btn primary">Go to Openpath</Link>
          </section>
        )}
        {run && (
          <div className="col">
            <section className="card">
              <p className="eyebrow">Shared run</p>
              <h2>{run.case.vendor} · {run.case.invoiceNumber}</h2>
              <p className="sub">${run.case.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{run.case.notes ? ` · ${run.case.notes}` : ""}</p>
            </section>
            <DecisionCard result={run.decision} />
            <section className="card rise">
              <header className="card-head tight"><div><h2>Decision path</h2><p className="sub">Each step, who ran it, and what it found.</p></div></header>
              <PathGraph path={run.decision.path} ms={run.decision.ms} />
            </section>
            {evalId && <ScoreCard evalId={evalId} state={evalState} message={null} elapsed={elapsed} />}
          </div>
        )}
      </main>
      <footer className="foot wrap">Openpath · Fixed rules, AI judgment, every step on record.</footer>
    </>
  );
}
