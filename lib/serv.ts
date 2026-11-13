// SERV Reasoning chat completions, shared by the judgment step and the rule compiler.
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function servChat(messages: ChatMessage[], modelOverride?: string): Promise<{ text: string; model: string }> {
  const key = process.env.SERV_API_KEY;
  const model = modelOverride || process.env.SERV_MODEL;
  if (!key || !model) throw new Error("Set SERV_API_KEY and SERV_MODEL.");

  const res = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) throw new Error(`SERV error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content ?? "", model };
}

export function firstJson<T>(text: string): T {
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("SERV returned no JSON");
  return JSON.parse(json) as T;
}
