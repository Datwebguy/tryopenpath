"use client";

import { useEffect, useState } from "react";
import { humanize } from "@/lib/format";
import type { EvalResult } from "@/lib/types";

type Props = {
  evalId: string | null;
  state: EvalResult | null;
  message: string | null;
  previous?: number;
  elapsed: number;
};

const R = 46;
const C = 2 * Math.PI * R;

function Ring({ score }: { score: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(id);
  }, [score]);
  const tone = score >= 85 ? "good" : score >= 60 ? "mid" : "low";
  return (
    <div className={`ring ${tone}`}>
      <svg viewBox="0 0 110 110" width="116" height="116" aria-hidden>
        <circle cx="55" cy="55" r={R} className="ring-bg" />
        <circle cx="55" cy="55" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C - (C * shown) / 100} transform="rotate(-90 55 55)" />
      </svg>
      <div className="ring-num"><strong>{score}</strong><span>/100</span></div>
    </div>
  );
}

export default function ScoreCard({ evalId, state, message, previous, elapsed }: Props) {
  const settled = state?.status === "SETTLED" && state.score !== undefined;
  const delta = settled && previous !== undefined ? state!.score! - previous : undefined;

  return (
    <section className="card score rise" aria-live="polite">
      <header className="card-head tight">
        <div>
          <h2>Reppo score</h2>
          <p className="sub">Independent evaluators score every decision.</p>
        </div>
        {evalId && <code className="evalid" title="Evaluation id">{evalId.slice(0, 10)}…</code>}
      </header>

      {message && !evalId && <p className="notice info">{message}</p>}

      {evalId && !settled && state?.status !== "FAILED" && (
        <div className="pending">
          <span className="pulse" />
          <div>
            <strong>Scoring in progress</strong>
            <p className="sub">Evaluators are reviewing this decision. Usually 30 to 90 seconds · {elapsed}s</p>
          </div>
        </div>
      )}

      {state?.status === "FAILED" && <p className="notice info">{state.reason ?? "The evaluation ended early. Run the case again to score it."}</p>}

      {settled && state && (
        <div className="score-body rise">
          <div className="score-top">
            <Ring score={state.score!} />
            <div className="score-meta">
              <div className="chips">
                {state.verdict && <span className={`pill ${state.verdict === "accept" ? "pass" : "fail"}`}>{humanize(state.verdict)}</span>}
                {state.route && <span className="pill info">Route: {state.route}</span>}
                {delta !== undefined && (
                  <span className={`pill ${delta >= 0 ? "pass" : "warn"}`}>
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs previous run ({previous})
                  </span>
                )}
              </div>
              {state.reason && <p className="score-reason">{state.reason}</p>}
            </div>
          </div>
          {state.critiques && state.critiques.length > 0 && (
            <div className="bars">
              {state.critiques.map((k) => (
                <div className="bar-row" key={k.criterion}>
                  <span>{humanize(k.criterion)}</span>
                  <div className="bar"><i style={{ width: `${k.score}%` }} /></div>
                  <b>{k.score}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
