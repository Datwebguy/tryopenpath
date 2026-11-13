"use client";

import { useCallback, useEffect, useState } from "react";
import type { Policy } from "@/lib/policy";
import PathGraph from "./PathGraph";
import type { Case, Decision, EvalResult, Run } from "@/lib/types";

export default function Home() {
  const [lastCase, setLastCase] = useState<Case | null>(null);
  const [result, setResult] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
  const [evalId, setEvalId] = useState<string | null>(null);
  const [evalState, setEvalState] = useState<EvalResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [history, setHistory] = useState<Run[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyLoaded, setPolicyLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistory(await (await fetch("/api/history")).json());
  }, []);

  useEffect(() => {
    loadHistory();
    fetch("/api/policy").then((r) => r.json()).then((p) => {
      setPolicy(p);
      setPolicyLoaded(true);
    });
  }, [loadHistory]);

  async function savePolicy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const lines = (k: string) => String(f.get(k) ?? "").split("\n");
    const res = await fetch("/api/policy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: f.get("text"),
        limit: Number(f.get("limit")),
        vendors: lines("vendors"),
        pos: lines("pos"),
      }),
    });
    const body = await res.json();
    if (!res.ok) return setPolicyError(body.error);
    setPolicyError(null);
    setPolicy(body);
    setSaved(true);
    setEditing(false);
  }

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
    const body = await res.json();
    if (!res.ok) {
      setLoading(false);
      setEvalError(body.error ?? "Request failed");
      return;
    }
    const decision: Decision = body;
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
      {policyLoaded && (
        <div className="policy">
          {policy ? (
            <>
              <strong>Policy:</strong> {policy.text}
              <div className="detail">
                Limit ${policy.limit} · {policy.vendors.length} approved vendors · {policy.pos.length} known POs
                {saved && " · saved"}
              </div>
              <button type="button" style={{ marginTop: 8 }} onClick={() => setEditing(!editing)}>
                {editing ? "Cancel" : "Edit rules"}
              </button>
            </>
          ) : (
            <strong>No policy yet. Set your rules to start.</strong>
          )}
          {(editing || !policy) && (
            <form onSubmit={savePolicy} style={{ marginTop: 10 }}>
              <label className="detail">Policy text (read by the judgment model)</label>
              <textarea name="text" rows={4} defaultValue={policy?.text ?? ""} required />
              <label className="detail">Spending limit in USD (checked by code)</label>
              <input name="limit" type="number" step="0.01" defaultValue={policy?.limit ?? ""} required />
              <label className="detail">Approved vendors, one per line (checked by code)</label>
              <textarea name="vendors" rows={4} defaultValue={policy?.vendors.join("\n") ?? ""} />
              <label className="detail">Known PO numbers, one per line (checked by code)</label>
              <textarea name="pos" rows={4} defaultValue={policy?.pos.join("\n") ?? ""} />
              {policyError && <div className="detail">{policyError}</div>}
              <button>Save rules</button>
            </form>
          )}
        </div>
      )}

      {policy && (
      <form onSubmit={submit}>
        <input name="amount" type="number" step="0.01" placeholder="Amount (USD)" required />
        <input name="vendor" placeholder="Vendor" required />
        <input name="invoiceNumber" placeholder="Invoice / PO number" required />
        <textarea name="notes" placeholder="Notes" rows={3} />
        <button disabled={loading}>{loading ? "Running..." : "Run case"}</button>
      </form>
      )}
      {evalError && !result && <p className="detail">{evalError}</p>}

      {result && (
        <section>
          <div className={`decision ${result.decision}`}>{result.decision}</div>
          <p>{result.reason}</p>
          <PathGraph path={result.path} />

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
