import { firstJson, servChat } from "./serv";
import type { Case } from "./types";

const SYSTEM_PROMPT = `You are Openpath, a policy enforcement agent.
The fixed rules (spending limit, PO number, approved vendor) have already been checked and passed.
Your only job is the judgment step: read the case notes and decide whether anything
looks suspicious or needs a person. Return only valid JSON:
{ "decision": "approve" | "escalate", "reason": "string" }`;

export type Judged = { decision: "approve" | "escalate"; reason: string; provider: string };

// Judgment step, powered by SERV Reasoning.
export async function judge(policy: string, c: Case, feedback?: string): Promise<Judged> {
  const { text, model } = await servChat([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `Policy: ${policy}\nCase: ${JSON.stringify(c)}` +
        (feedback ? `\nA previous run of this same case was scored. Address this feedback:\n${feedback}` : ""),
    },
  ]);
  const out = firstJson<{ decision: string; reason: string }>(text);
  if (out.decision !== "approve" && out.decision !== "escalate") throw new Error("SERV returned an invalid decision");
  return { decision: out.decision, reason: out.reason, provider: `serv (${model})` };
}
