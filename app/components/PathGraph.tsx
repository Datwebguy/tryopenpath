import { duration, providerLabel, resultLabel, stepLabel } from "@/lib/format";
import type { Step } from "@/lib/types";
import { AlertIcon, CheckIcon, CodeIcon, SkipIcon, SparkIcon, XIcon } from "./Icons";

type Tone = "pass" | "fail" | "skip" | "warn" | "info";

const PASS = ["ok", "passed", "approve"];
const FAIL = ["failed", "deny"];

function tone(s: Step): Tone {
  if (s.result === "skipped") return "skip";
  if (s.result === "error" || s.result === "escalate") return "warn";
  if (PASS.includes(s.result)) return "pass";
  if (FAIL.includes(s.result)) return "fail";
  return "info";
}

const ToneIcon = ({ t }: { t: Tone }) =>
  t === "pass" ? <CheckIcon width={15} height={15} /> :
  t === "fail" ? <XIcon width={15} height={15} /> :
  t === "warn" ? <AlertIcon width={15} height={15} /> :
  t === "skip" ? <SkipIcon width={15} height={15} /> : <CheckIcon width={15} height={15} />;

export function PathSkeleton() {
  return (
    <div className="graph" aria-busy="true" aria-label="Checking the case">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="node skeleton" style={{ animationDelay: `${i * 120}ms` }}>
            <span className="shimmer w1" /><span className="shimmer w2" />
          </div>
          {i < 3 && <div className="link" />}
        </div>
      ))}
    </div>
  );
}

export default function PathGraph({ path, ms }: { path: Step[]; ms?: number }) {
  const code = path.filter((s) => s.type === "code").length;
  const model = path.filter((s) => s.type === "model" && s.result !== "skipped").length;
  const skipped = path.filter((s) => s.result === "skipped").length;

  return (
    <div>
      <div className="path-stats">
        <span className="stat code"><CodeIcon width={14} height={14} /> {code} rule check{code === 1 ? "" : "s"}</span>
        <span className="stat model"><SparkIcon width={14} height={14} /> {model} AI judgment{model === 1 ? "" : "s"}</span>
        {skipped > 0 && <span className="stat skip"><SkipIcon width={14} height={14} /> {skipped} skipped</span>}
        {ms !== undefined && <span className="stat time">{duration(ms)} total</span>}
      </div>

      <div className="graph">
        {path.map((s, i) => {
          const t = tone(s);
          return (
            <div key={`${s.step}-${i}`}>
              <div className={`node ${s.type} ${t}`} style={{ animationDelay: `${i * 90}ms` }}>
                <span className={`node-icon ${s.type}`}>{s.type === "code" ? <CodeIcon width={16} height={16} /> : <SparkIcon width={16} height={16} />}</span>
                <div className="node-body">
                  <div className="node-head">
                    <span className="node-name">{stepLabel(s.step)}</span>
                    <span className={`pill ${t}`}><ToneIcon t={t} /> {resultLabel(s.result)}</span>
                  </div>
                  <div className="node-meta">
                    <span className={`kind ${s.type}`}>{s.type === "code" ? "Rule" : "AI"}</span>
                    {s.provider && <span className="provider">{providerLabel(s.provider)}</span>}
                    {s.ms !== undefined && <span className="provider">{duration(s.ms)}</span>}
                  </div>
                  {s.detail && <p className="node-detail">{s.detail}</p>}
                </div>
              </div>
              {i < path.length - 1 && <div className="link" style={{ animationDelay: `${i * 90 + 60}ms` }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
