"use client";

import { useState } from "react";
import type { Policy } from "@/lib/policy";
import { money } from "@/lib/format";
import { EditIcon, ShieldIcon } from "./Icons";
import TagInput from "./TagInput";

type Props = {
  policy: Policy | null;
  onSave: (p: Policy) => Promise<string | null>;
  onReset: () => void;
};

export default function PolicyCard({ policy, onSave, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(policy?.text ?? "");
  const [limit, setLimit] = useState(policy ? String(policy.limit) : "");
  const [vendors, setVendors] = useState<string[]>(policy?.vendors ?? []);
  const [pos, setPos] = useState<string[]>(policy?.pos ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const open = editing || !policy;

  function startEdit() {
    if (policy) {
      setText(policy.text);
      setLimit(String(policy.limit));
      setVendors(policy.vendors);
      setPos(policy.pos);
    }
    setEditing(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const err = await onSave({ text, limit: Number(limit), vendors, pos });
    setSaving(false);
    setError(err);
    if (!err) setEditing(false);
  }

  return (
    <section className="card" aria-labelledby="policy-title">
      <header className="card-head">
        <div className="card-title">
          <span className="card-icon"><ShieldIcon /></span>
          <div>
            <h2 id="policy-title">{policy ? "Policy" : "Write your first policy"}</h2>
            <p className="sub">
              {policy ? "The rules every case is checked against." : "Write it in plain words, then set the exact limits."}
            </p>
          </div>
        </div>
        {policy && !open && (
          <button className="btn ghost sm" onClick={startEdit}>
            <EditIcon width={15} height={15} /> Edit
          </button>
        )}
      </header>

      {!open && policy && (
        <div className="policy-view rise">
          <blockquote>{policy.text}</blockquote>
          <dl className="facts">
            <div><dt>Spending limit</dt><dd>{money(policy.limit)}</dd></div>
            <div><dt>Approved vendors</dt><dd>{policy.vendors.length}</dd></div>
            <div><dt>Known POs</dt><dd>{policy.pos.length}</dd></div>
          </dl>
        </div>
      )}

      {open && (
        <form className="form rise" onSubmit={submit}>
          <div className="field">
            <label className="label" htmlFor="ptext">Policy in plain language</label>
            <textarea id="ptext" rows={4} value={text} onChange={(e) => setText(e.target.value)} required
              placeholder="Describe when a case should be approved, denied, or sent to a person." />
            <p className="hint">The AI reads this, and every decision is scored against it.</p>
          </div>
          <div className="field">
            <label className="label" htmlFor="plimit">Spending limit (USD)</label>
            <div className="input-prefix"><span>$</span>
              <input id="plimit" type="number" min="0" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} required placeholder="0.00" />
            </div>
            <p className="hint">Checked exactly on every case.</p>
          </div>
          <TagInput label="Approved vendors" hint="Press Enter after each one." values={vendors} onChange={setVendors} placeholder="Add a vendor" />
          <TagInput label="Known PO numbers" hint="Press Enter after each one." values={pos} onChange={setPos} placeholder="Add a PO number" />
          {error && <p className="notice err" role="alert">{error}</p>}
          <div className="row">
            <button className="btn primary" disabled={saving}>{saving ? "Saving…" : policy ? "Save changes" : "Save policy"}</button>
            {policy && <button type="button" className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>}
            {policy && (confirmReset
              ? <button type="button" className="btn danger" onClick={onReset}>Remove this policy</button>
              : <button type="button" className="btn ghost push" onClick={() => setConfirmReset(true)}>Start over</button>)}
          </div>
        </form>
      )}
    </section>
  );
}
