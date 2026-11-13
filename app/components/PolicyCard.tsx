"use client";

import { useState } from "react";
import type { Policy } from "@/lib/policy";
import { describeRule, type Rule } from "@/lib/rules";
import { money } from "@/lib/format";
import { EditIcon, ShieldIcon, SparkIcon, XIcon } from "./Icons";
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
  const [rules, setRules] = useState<Rule[]>(policy?.rules ?? []);
  const [ruleText, setRuleText] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const open = editing || !policy;

  function startEdit() {
    if (policy) {
      setText(policy.text);
      setLimit(String(policy.limit));
      setVendors(policy.vendors);
      setPos(policy.pos);
      setRules(policy.rules ?? []);
    }
    setEditing(true);
  }

  async function addRule() {
    if (!ruleText.trim() || compiling) return;
    setCompiling(true);
    setRuleError(null);
    try {
      const res = await fetch("/api/rules/compile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: ruleText }) });
      const out = await res.json();
      if (out.rule) {
        setRules((r) => [...r, out.rule]);
        setRuleText("");
      } else {
        setRuleError(out.error ?? "That rule did not come through. Please try again.");
      }
    } catch {
      setRuleError("That rule did not come through. Please try again.");
    }
    setCompiling(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const err = await onSave({ text, limit: Number(limit), vendors, pos, rules });
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
            <div><dt>Your rules</dt><dd>{policy.rules?.length ?? 0}</dd></div>
          </dl>
          {policy.rules?.length > 0 && (
            <ul className="rule-list">
              {policy.rules.map((r) => (
                <li key={r.id}><b>{r.label}</b><span>{describeRule(r)}</span></li>
              ))}
            </ul>
          )}
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
          <div className="field">
            <label className="label" htmlFor="newrule">Rules in your own words <span className="opt">optional</span></label>
            {rules.map((r) => (
              <div className="rule-card rise" key={r.id}>
                <div className="rule-head">
                  <b>{r.label}</b>
                  <span className={`pill ${r.then === "deny" ? "fail" : "warn"}`}>{r.then === "deny" ? "Deny" : "Send to a person"}</span>
                  <button type="button" className="rule-x" aria-label={`Remove ${r.label}`} onClick={() => setRules(rules.filter((x) => x.id !== r.id))}><XIcon width={14} height={14} /></button>
                </div>
                <p className="rule-said">“{r.text}”</p>
                <p className="rule-how"><SparkIcon width={13} height={13} /> {describeRule(r)}</p>
              </div>
            ))}
            <div className="rule-add">
              <input id="newrule" value={ruleText} onChange={(e) => setRuleText(e.target.value)} placeholder="Describe a rule"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRule(); } }} />
              <button type="button" className="btn secondary" disabled={compiling || !ruleText.trim()} onClick={addRule}>
                {compiling ? <><span className="spinner dark" /> Writing…</> : "Add with SERV"}
              </button>
            </div>
            {ruleError && <p className="notice info" role="status">{ruleError}</p>}
            <p className="hint">SERV Reasoning turns your sentence into an exact rule. You see it before you save, and it runs the same way every time.</p>
          </div>
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
