"use client";

import { useCallback, useEffect, useState } from "react";
import { POLICY_TEXT } from "@/lib/policy";
import type { Case, Decision, EvalResult, Run } from "@/lib/types";

export default function Home() {
  const [lastCase, setLastCase] = useState<Case | null>(null);
  const [result, setResult] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
  const [evalId, setEvalId] = useState<string | null>(null);
  const [evalState, setEvalState] = useState<EvalResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [history, setHistory] = useState<Run[]>([]);

  const loadHistory = useCallback(async () => {
    setHistory(await (await fetch("/api/history")).json());
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Poll Reppo until the evaluation settles.
  useEffect(() => {
    if (!evalId) return;
    let stop = false;
    async function poll() {
      const r = await (await fetch(`/api/evaluate/${evalId}`)).json();
      if (stop) return;
      if (r.error) return setEvalError(r.error);
      setEvalState(r);
      if (r.status === "PENDING") setTimeout(poll, 10000);
      else loadHistory();
    }
    poll();
    return () => {
      stop = true;
    };
  }, [evalId, loadHistory]);

  async function run(c: Case) {
    setLastCase(c);
    setLoading(true);
    setEvalId(null);
    setEvalState(null);
    setEvalError(null);
    const res = await fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    const decision: Decision = await res.json();
    setResult(decision);
    setLoading(false);

    // Send the finished decision to Reppo for scoring.
    const ev = await (
      await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: c, decision }),
      })
    ).json();
    if (ev.error) setEvalError(ev.error);
    else setEvalId(ev.evalId);
    loadHistory();
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run({
      amount: Number(f.get("amount")),
      vendor: String(f.get("vendor")),
      invoiceNumber: String(f.get("invoiceNumber")),
      notes: String(f.get("notes") ?? ""),
    });
  }

  return (
    <main>
      <h1>Openpath</h1>
      <p>See the exact path every agent decision takes.</p>
      <div className="policy"><strong>Policy:</strong> {POLICY_TEXT}</div>

      <form onSubmit={submit}>
        <input name="amount" type="number" step="0.01" placeholder="Amount (USD)" defaultValue="250" required />
        <input name="vendor" placeholder="Vendor" defaultValue="Acme Supplies" required />
        <input name="invoiceNumber" placeholder="Invoice / PO number" defaultValue="PO-1001" required />
        <textarea name="notes" placeholder="Notes" rows={3} />
        <button disabled={loading}>{loading ? "Running..." : "Run case"}</button>
      </form>

      {result && (
        <section>
          <div className={`decision ${result.decision}`}>{result.decision}</div>
          <p>{result.reason}</p>
          {result.path.map((s, i) => (
            <div className="step" key={i}>
              <span className={`tag ${s.type}`}>{s.type}</span>
              <span>
                {s.step}: <strong>{s.result}</strong>
                {s.provider && <div className="detail">via {s.provider}</div>}
                {s.detail && <div className="detail">{s.detail}</div>}
              </span>
            </div>
          ))}

          <h3>Reppo score</h3>
          {evalError && <p className="detail">Not scored: {evalError}</p>}
          {evalId && <p className="detail">evalId: {evalId}</p>}
          {evalState?.status === "PENDING" && <p>Scoring... (can take up to 10 minutes)</p>}
          {evalState?.status === "FAILED" && <p>Evaluation failed: {evalState.reason}</p>}
          {evalState?.status === "SETTLED" && (
            <>
              <p>
                <strong>{evalState.score}/100</strong> ({evalState.verdict})
              </p>
              {evalState.critiques?.map((k, i) => (
                <div className="detail" key={i}>
                  {k.score}/10 {k.criterion}: {k.critique}
                </div>
              ))}
            </>
          )}

          <button style={{ marginTop: 12 }} disabled={loading || !lastCase} onClick={() => lastCase && run(lastCase)}>
            Re-run same case with stored feedback
          </button>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h3>History</h3>
          {history.map((h, i) => (
            <div className="step" key={i}>
              <span className={`decision-sm ${h.decision.decision}`}>{h.decision.decision}</span>
              <span>
                {h.case.vendor} / {h.case.invoiceNumber} / ${h.case.amount}
                <div className="detail">
                  {new Date(h.at).toLocaleTimeString()} ·{" "}
                  {h.eval?.status === "SETTLED"
                    ? `Reppo ${h.eval.score}/100`
                    : h.evalId
                      ? "Reppo pending"
                      : "not scored"}
                </div>
              </span>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
