"use client";

import { useState } from "react";
import { XIcon } from "./Icons";

type Props = {
  label: string;
  hint: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
};

// Type a value and press Enter or comma. Pasting a list works too.
export default function TagInput({ label, hint, values, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState("");

  function commit(text: string) {
    const parts = text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...values, ...parts])]);
    setDraft("");
  }

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="tags">
        {values.map((v) => (
          <span className="tag-chip" key={v}>
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
              <XIcon width={12} height={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={values.length ? "" : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit(draft);
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => draft && commit(draft)}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text");
            if (/[\n,]/.test(t)) {
              e.preventDefault();
              commit(t);
            }
          }}
        />
      </div>
      <p className="hint">{hint}</p>
    </div>
  );
}
