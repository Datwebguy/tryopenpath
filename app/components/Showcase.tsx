"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { AlertIcon, CheckIcon, CodeIcon, PlayIcon, SparkIcon, XIcon } from "./Icons";

type Item = {
  id: string;
  title: string;
  note?: string;
  vendor: string;
  amount: number;
  notes: string;
  decision: "approve" | "deny" | "escalate";
  reason: string;
  decidedBy: "rule" | "ai";
  ruleChecks: number;
  score?: number;
};

// Real saved runs from the live site, each one a different situation.
export default function Showcase({ onLoaded }: { onLoaded: (has: boolean) => void }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/showcase")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Item[]) => {
        setItems(d);
        onLoaded(d.length > 0);
      })
      .catch(() => onLoaded(false));
  }, [onLoaded]);

  if (items.length === 0) return null;

  return (
    <section className="showcase" id="showcase" aria-labelledby="showcase-title">
      <div className="section-head">
        <h2 id="showcase-title">See it in action</h2>
        <p className="sub">Real runs on this site, with real AI calls and real scores. Open any one to see its full path.</p>
      </div>
      <div className="show-grid">
        {items.map((it, i) => {
          const tone = it.decision === "approve" ? "pass" : it.decision === "deny" ? "fail" : "warn";
          return (
            <Link href={`/run/${it.id}`} className={`show-card ${tone}`} key={it.id} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="show-top">
                <span className={`show-badge ${tone}`}>
                  {it.decision === "approve" ? <CheckIcon width={16} height={16} /> : it.decision === "deny" ? <XIcon width={16} height={16} /> : <AlertIcon width={16} height={16} />}
                </span>
                <span className={`pill ${tone}`}>{it.decision === "approve" ? "Approved" : it.decision === "deny" ? "Denied" : "Sent to a person"}</span>
                {it.score !== undefined && <span className="show-score">Reppo <b>{it.score}</b>/100</span>}
              </div>
              <h3>{it.title}</h3>
              {it.note && <p className="show-note">{it.note}</p>}
              <p className="show-case">{it.vendor} · {money(it.amount)}{it.notes ? ` · “${it.notes}”` : ""}</p>
              <p className="show-reason">{it.reason}</p>
              <div className="show-foot">
                <span className={`show-by ${it.decidedBy}`}>
                  {it.decidedBy === "rule" ? <><CodeIcon width={13} height={13} /> Decided by a rule. AI not asked.</> : <><SparkIcon width={13} height={13} /> Judged by SERV Reasoning</>}
                </span>
                <span className="show-open">Open the full path →</span>
              </div>
            </Link>
          );
        })}
        {items.length % 3 !== 0 && (
        <button type="button" className="show-card cta-card" style={{ animationDelay: `${items.length * 70}ms` }}
          onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <span className="cta-icon"><PlayIcon width={18} height={18} /></span>
          <h3>Your turn</h3>
          <p className="show-note">Write a policy, add a rule in your own words, and run a case. Every step shows up live, with a real score.</p>
          <span className="show-open">Try it yourself →</span>
        </button>
        )}
      </div>
    </section>
  );
}
