import type { Step } from "@/lib/types";

// Result words that count as a pass or a fail. Anything else is shown neutral.
const PASS = ["ok", "passed", "approve"];
const FAIL = ["failed", "deny"];

function status(s: Step): "pass" | "fail" | "skip" | "warn" | "info" {
  if (s.result === "skipped") return "skip";
  if (s.result === "error" || s.result === "escalate") return "warn";
  if (PASS.includes(s.result)) return "pass";
  if (FAIL.includes(s.result)) return "fail";
  return "info";
}

export default function PathGraph({ path }: { path: Step[] }) {
  const code = path.filter((s) => s.type === "code").length;
  const model = path.filter((s) => s.type === "model" && s.result !== "skipped").length;
  const skipped = path.filter((s) => s.result === "skipped").length;

  return (
    <div>
      <div className="detail">
        {code} code step{code === 1 ? "" : "s"} · {model} model call{model === 1 ? "" : "s"}
        {skipped > 0 && ` · ${skipped} skipped`}
      </div>
      <div className="graph">
        {path.map((s, i) => (
          <div key={i}>
            <div className={`node ${s.type} ${status(s)}`}>
              <div className="node-head">
                <span className={`tag ${s.type}`}>{s.type}</span>
                <span className="node-name">{s.step}</span>
                <span className="node-result">{s.result}</span>
              </div>
              {s.provider && <div className="detail">via {s.provider}</div>}
              {s.detail && <div className="detail">{s.detail}</div>}
            </div>
            {i < path.length - 1 && <div className="link" />}
          </div>
        ))}
      </div>
    </div>
  );
}
