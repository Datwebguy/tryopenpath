"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { Run } from "@/lib/types";
import DecisionCard from "../../components/DecisionCard";
import Logo from "../../components/Logo";
import PathGraph from "../../components/PathGraph";
import ScoreCard from "../../components/ScoreCard";

type Shared = Omit<Run, "evalId"> & { pending?: boolean };

// A shared, read-only view of one run: its decision, its path and its score.
export default function SharedRun({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<Shared | null>(null);
  const [missing, setMissing] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Load the run, and keep checking while its score is still coming in.
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      const r = await fetch(`/api/runs/${id}`);
      if (stop) return;
      if (!r.ok) return setMissing(true);
      const data: Shared = await r.json();
      setRun(data);
      if (data.pending) timer = setTimeout(load, 5000);
    }
    load();
    return () => { stop = true; clearTimeout(timer); };
  }, [id]);

  useEffect(() => {
    if (!run?.pending) return;
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [run?.pending]);

  const scored = run && (run.pending || run.eval);

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
            {scored && <ScoreCard evalId="shared" state={run.eval ?? { evalId: "shared", status: "PENDING" }} message={null} elapsed={elapsed} />}
          </div>
        )}
      </main>
      <footer className="foot wrap">Openpath · Fixed rules, AI judgment, every step on record.</footer>
    </>
  );
}
