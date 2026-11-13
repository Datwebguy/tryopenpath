"use client";

import { useState } from "react";
import { ago, money } from "@/lib/format";
import type { Run } from "@/lib/types";

type Props = { runs: Run[]; activeAt?: string; onSelect: (r: Run) => void; onClear: () => void };

export default function History({ runs, activeAt, onSelect, onClear }: Props) {
  const [confirm, setConfirm] = useState(false);
  if (runs.length === 0) return null;
  return (
    <section className="card" aria-labelledby="hist-title">
      <header className="card-head tight">
        <div>
          <h2 id="hist-title">History</h2>
          <p className="sub">Every run is saved with its path and score. Open one to review it.</p>
        </div>
        {confirm ? (
          <div className="row confirm">
            <button className="btn danger sm" onClick={() => { setConfirm(false); onClear(); }}>Clear all {runs.length}</button>
            <button className="btn ghost sm" onClick={() => setConfirm(false)}>Keep</button>
          </div>
        ) : (
          <button className="btn ghost sm" onClick={() => setConfirm(true)}>Clear history</button>
        )}
      </header>
      <ul className="history">
        {runs.map((r) => (
          <li key={r.at}>
            <button className={`hist-item ${r.at === activeAt ? "active" : ""}`} onClick={() => onSelect(r)}>
              <span className={`pill ${r.decision.decision === "approve" ? "pass" : r.decision.decision === "deny" ? "fail" : "warn"}`}>
                {r.decision.decision}
              </span>
              <span className="hist-main">
                <b>{r.case.vendor}</b>
                <small>{r.case.invoiceNumber} · {money(r.case.amount)} · {ago(r.at)}</small>
              </span>
              <span className="hist-score">
                {r.eval?.status === "SETTLED" ? <><b>{r.eval.score}</b><small>/100</small></> : r.evalId ? <small>scoring</small> : <small>—</small>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
