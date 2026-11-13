import type { Case } from "./types";

const SYSTEM_PROMPT = `You are Openpath, a policy enforcement agent.
The fixed rules (spending limit, PO number, approved vendor) have already been checked and passed.
Your only job is the judgment step: read the case notes and decide whether anything
looks suspicious or needs a person. Return only valid JSON:
{ "decision": "approve" | "escalate", "reason": "string" }`;

export type Judged = { decision: "approve" | "escalate"; reason: string; provider: string };

// Judgment step, powered by SERV Reasoning (chat completions).
export async function judge(policy: string, c: Case, feedback?: string): Promise<Judged> {
  const key = process.env.SERV_API_KEY;
  const model = process.env.SERV_MODEL;
  if (!key || !model) throw new Error("Set SERV_API_KEY and SERV_MODEL.");

  const res = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Policy: ${policy}\nCase: ${JSON.stringify(c)}` +
            (feedback ? `\nA previous run of this same case was scored. Address this feedback:\n${feedback}` : ""),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`SERV error ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("SERV returned no JSON");
  const out = JSON.parse(json) as { decision: string; reason: string };
  if (out.decision !== "approve" && out.decision !== "escalate") throw new Error("SERV returned an invalid decision");
  return { decision: out.decision, reason: out.reason, provider: `serv (${model})` };
}
