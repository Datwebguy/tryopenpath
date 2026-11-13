import { CheckIcon } from "./Icons";

const LABELS = ["Policy", "Case", "Path", "Score", "Re-run"];

// `done` is how many steps are complete. The next one is highlighted as current.
export default function Stepper({ done }: { done: number }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {LABELS.map((label, i) => {
        const state = i < done ? "done" : i === done ? "current" : "todo";
        return (
          <li key={label} className={`step-pill ${state}`}>
            <span className="step-dot">{state === "done" ? <CheckIcon width={13} height={13} /> : i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
