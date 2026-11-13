"use client";

import type { Policy } from "@/lib/policy";
import { PlayIcon } from "./Icons";

export type Draft = { amount: string; vendor: string; invoiceNumber: string; notes: string };

type Props = {
  policy: Policy;
  draft: Draft;
  onChange: (d: Draft) => void;
  onRun: () => void;
  loading: boolean;
};

export default function CaseForm({ policy, draft, onChange, onRun, loading }: Props) {
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...draft, [k]: e.target.value });

  return (
    <section className="card" aria-labelledby="case-title">
      <header className="card-head">
        <div className="card-title">
          <span className="card-icon"><PlayIcon /></span>
          <div>
            <h2 id="case-title">Run a case</h2>
            <p className="sub">Submit an invoice and watch the decision unfold.</p>
          </div>
        </div>
      </header>

      <form className="form" onSubmit={(e) => { e.preventDefault(); onRun(); }}>
        <div className="grid2">
          <div className="field">
            <label className="label" htmlFor="amount">Amount</label>
            <div className="input-prefix"><span>$</span>
              <input id="amount" type="number" min="0" step="0.01" value={draft.amount} onChange={set("amount")} required placeholder="0.00" />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="invoice">Invoice / PO number</label>
            <input id="invoice" list="po-list" value={draft.invoiceNumber} onChange={set("invoiceNumber")} required placeholder="Start typing" />
            <datalist id="po-list">{policy.pos.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="vendor">Vendor</label>
          <input id="vendor" list="vendor-list" value={draft.vendor} onChange={set("vendor")} required placeholder="Start typing" />
          <datalist id="vendor-list">{policy.vendors.map((v) => <option key={v} value={v} />)}</datalist>
        </div>
        <div className="field">
          <label className="label" htmlFor="notes">Notes <span className="opt">optional</span></label>
          <textarea id="notes" rows={3} value={draft.notes} onChange={set("notes")} placeholder="Anything the reviewer should know about this invoice." />
        </div>
        <button className="btn primary lg" disabled={loading}>
          {loading ? <><span className="spinner" /> Checking the case…</> : <><PlayIcon width={16} height={16} /> Run case</>}
        </button>
      </form>
    </section>
  );
}
