import { CodeIcon, ShieldIcon, SparkIcon } from "./Icons";

// What Openpath is, for someone who has never seen it.
export default function Intro({ hasShowcase }: { hasShowcase: boolean }) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section className="intro">
      <p className="kicker">Guardrails you can prove, for AI that approves payments</p>
      <h1>See the exact path every decision takes.</h1>
      <p className="lead">
        AI agents are starting to approve invoices and payments. When one says yes, nobody can see why, or prove the rules were followed.
        Openpath puts every decision on a path you can inspect: fixed rules the AI cannot talk its way around, AI judgment only where it is needed,
        and an independent score on every call.
      </p>
      <div className="cta">
        {hasShowcase && <button className="btn primary" onClick={() => go("showcase")}>See it in action</button>}
        <button className={`btn ${hasShowcase ? "secondary" : "primary"}`} onClick={() => go("try")}>Try it yourself</button>
      </div>

      <div className="pillars">
        <div className="pillar">
          <span className="pillar-icon code"><CodeIcon /></span>
          <h3>Rules the AI cannot override</h3>
          <p>Spending limits, known POs, approved vendors and your own rules are checked exactly, every time. If a rule decides, the AI is never asked.</p>
        </div>
        <div className="pillar">
          <span className="pillar-icon model"><SparkIcon /></span>
          <h3>AI only for judgment</h3>
          <p>SERV Reasoning reads what rules cannot, such as notes that sound like fraud, and it treats those notes as untrusted text it never obeys.</p>
        </div>
        <div className="pillar">
          <span className="pillar-icon score"><ShieldIcon /></span>
          <h3>Every call scored</h3>
          <p>Reppo&apos;s independent evaluators score each decision. The score feeds the next run, and any run can be shared as proof.</p>
        </div>
      </div>
      <p className="built">Built on <b>SERV Reasoning</b> · scored by <b>Reppo</b> · ready for <b>Kite Passport</b> spending limits</p>
    </section>
  );
}
