import { POLICY_TEXT } from "./policy";
import type { Case } from "./types";

const SYSTEM_PROMPT = `You are Openpath, a policy enforcement agent.
All hard rules (limits, PO match, vendor allowlist) have already been checked by code and passed.
Your only job is the judgment step: read the case notes and decide whether anything
looks suspicious or needs a human. Return only valid JSON:
{ "decision": "approve" | "escalate", "reason": "string" }`;

export type ModelJudgment = { decision: "approve" | "escalate"; reason: string };

// Judgment node. Called through SERV Reasoning (chat completions).
export async function judge(c: Case, feedback?: string): Promise<ModelJudgment> {
  const res = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SERV_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.SERV_MODEL ?? "gpt-5-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Policy: ${POLICY_TEXT}\nCase: ${JSON.stringify(c)}` +
            (feedback
              ? `\nA previous run of this same case was scored. Address this feedback:\n${feedback}`
              : ""),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`SERV error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("SERV returned no JSON");
  return JSON.parse(json) as ModelJudgment;
}
