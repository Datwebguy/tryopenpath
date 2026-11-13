"use client";

import { useState } from "react";
import { POLICY_TEXT } from "@/lib/policy";
import type { Decision } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const res = await fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f)),
    });
    setResult(await res.json());
    setLoading(false);
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
                {s.detail && <div className="detail">{s.detail}</div>}
              </span>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
