import { duration } from "@/lib/format";
import type { Decision } from "@/lib/types";
import { AlertIcon, CheckIcon, XIcon } from "./Icons";

export default function DecisionCard({ result }: { result: Decision }) {
  const tone = result.decision === "approve" ? "pass" : result.decision === "deny" ? "fail" : "warn";
  return (
    <section className={`card decision-card ${tone} rise`}>
      <div className="decision-top">
        <span className={`decision-badge ${tone}`}>
          {result.decision === "approve" ? <CheckIcon width={22} height={22} /> : result.decision === "deny" ? <XIcon width={22} height={22} /> : <AlertIcon width={22} height={22} />}
        </span>
        <div>
          <p className="eyebrow">Decision</p>
          <h2 className="decision-word">{result.decision}</h2>
        </div>
        {result.ms !== undefined && <span className="decided-in">Decided in {duration(result.ms)}</span>}
      </div>
      <p className="decision-reason">{result.reason}</p>
    </section>
  );
}
