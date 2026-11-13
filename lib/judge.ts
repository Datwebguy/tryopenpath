import type { Case } from "./types";

const SYSTEM_PROMPT = `You are Openpath, a policy enforcement agent.
All hard rules (limits, PO match, vendor allowlist) have already been checked by code and passed.
Your only job is the judgment step: read the case notes and decide whether anything
looks suspicious or needs a human. Return only valid JSON:
{ "decision": "approve" | "escalate", "reason": "string" }`;

export type ModelJudgment = { decision: "approve" | "escalate"; reason: string };
export type Judged = ModelJudgment & { provider: string };

type Backend = { name: string; url: string; key?: string; model?: string };

const dolphin = (): Backend => ({
  name: "dolphin",
  url: "https://lighthouse.dphn.ai/run/text-v/v1/chat/completions",
  key: process.env.DOLPHIN_API_KEY,
  model: process.env.DOLPHIN_MODEL,
});

const serv = (): Backend => ({
  name: "serv",
  url: "https://inference-api.openserv.ai/v1/chat/completions",
  key: process.env.SERV_API_KEY,
  model: process.env.SERV_MODEL,
});

async function call(b: Backend, policy: string, c: Case, feedback?: string): Promise<ModelJudgment> {
  const res = await fetch(b.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${b.key}` },
    body: JSON.stringify({
      model: b.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Policy: ${policy}\nCase: ${JSON.stringify(c)}` +
            (feedback
              ? `\nA previous run of this same case was scored. Address this feedback:\n${feedback}`
              : ""),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${b.name} error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error(`${b.name} returned no JSON`);
  const out = JSON.parse(json) as ModelJudgment;
  if (out.decision !== "approve" && out.decision !== "escalate") {
    throw new Error(`${b.name} returned an invalid decision`);
  }
  return out;
}

// Judgment node. Open model (Dolphin) first when configured, SERV catalog as fallback.
export async function judge(policy: string, c: Case, feedback?: string): Promise<Judged> {
  const order = [dolphin(), serv()].filter((b) => b.key && b.model);
  if (process.env.JUDGE_PROVIDER === "serv") order.sort((a) => (a.name === "serv" ? -1 : 1));
  if (order.length === 0) throw new Error("Set an API key and model (SERV_API_KEY + SERV_MODEL, or DOLPHIN_API_KEY + DOLPHIN_MODEL)");

  const errors: string[] = [];
  for (const b of order) {
    try {
      const out = await call(b, policy, c, feedback);
      return { ...out, provider: `${b.name} (${b.model})` };
    } catch (e) {
      errors.push(String(e));
    }
  }
  throw new Error(errors.join(" | "));
}
