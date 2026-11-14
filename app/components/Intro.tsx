import { CodeIcon, ShieldIcon, SparkIcon } from "./Icons";

// What Openpath is, for someone who has never seen it.
export default function Intro({ hasShowcase }: { hasShowcase: boolean }) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section className="intro">
      <p className="kicker">For businesses letting AI agents pay invoices</p>
      <h1>Stop invoice fraud before your AI agent pays.</h1>
      <p className="lead">
        Fraudsters already target whoever pays the invoices: a changed bank account, an urgent message from the &ldquo;CEO&rdquo;,
        a note telling the reviewer to skip checks. Now AI agents pay invoices too, and an AI can be talked into a yes.
        Openpath sits between the agent and the money, and shows the exact path of every decision.
      </p>
      <div className="cta">
        {hasShowcase && <button className="btn primary" onClick={() => go("showcase")}>See it in action</button>}
        <button className={`btn ${hasShowcase ? "secondary" : "primary"}`} onClick={() => go("try")}>Try it yourself</button>
      </div>

      <div className="pillars">
        <div className="pillar">
          <span className="pillar-icon score"><ShieldIcon /></span>
          <h3>Catches the classic tricks</h3>
          <p>Changed bank details, urgency, impersonation, and notes that try to instruct the AI. The payment is held before any money moves.</p>
        </div>
        <div className="pillar">
          <span className="pillar-icon code"><CodeIcon /></span>
          <h3>Rules the AI cannot override</h3>
          <p>Limits, known POs, approved vendors, bank accounts on file, and rules you write in plain English are enforced exactly. If a rule decides, the AI is never asked.</p>
        </div>
        <div className="pillar">
          <span className="pillar-icon model"><SparkIcon /></span>
          <h3>Proof for every payment</h3>
          <p>Every step is on record, SERV Reasoning explains its judgment, Reppo scores each call independently, and one link shares the proof.</p>
        </div>
      </div>
      <p className="built">For small finance teams, bookkeepers, and anyone building an AI agent that pays bills · Built on <b>SERV Reasoning</b> · scored by <b>Reppo</b> · ready for <b>Kite Passport</b></p>
    </section>
  );
}
