# Agent Prompt for Openpath

Paste this entire prompt into Claude, Replit Agent, or your preferred coding agent.

---

You are building **Openpath**, a console for the SERV Hackathon Edition 02 (deadline 15 Nov 2026 23:59 UTC).

## Critical rules
- Do **not** list Claude, Anthropic, or any AI model as author, co-author, or contributor in any file, commit message, README, package.json, or comment.
- The human builder is the sole author.
- Focus on a working, demoable product. Prefer clear code over clever abstractions.
- Time is extremely short. Ship the minimal viable demo first.

## What Openpath is
A console that lets anyone define a policy, run a case against it, and see the exact path the decision took.

Core loop:
1. User selects or writes a policy (start with one hardcoded invoice/expense approval policy).
2. User submits a case (amount, vendor, invoice number, etc.).
3. The system uses SERV Reasoning to produce a structured decision + reasoning trace.
4. The UI shows the path: which steps ran as code (limits, field checks) and which called a model.
5. Kite-style identity + spending limit is checked (stub is acceptable if live setup is slow).
6. The decision is submitted to the Reppo Evaluation API and the score is shown.
7. User can re-run the same case and see the stored feedback influence the next result (or a simple before/after comparison).

## Stack recommendation
- Next.js (App Router) + TypeScript
- Simple UI (no heavy component library required; Tailwind is fine)
- Server actions or API routes for SERV / Reppo calls
- Environment variables for keys

## SERV integration
- Base URL: `https://inference-api.openserv.ai/v1`
- Auth: `Authorization: Bearer $SERV_API_KEY`
- Use `/v1/chat/completions` for broad compatibility.
- Every request **must** include a system prompt.
- System prompt should instruct the model to return a structured JSON decision plus a short step-by-step reasoning path that distinguishes code-check steps from model-judgment steps.

Example system prompt direction:
```
You are Openpath, a policy enforcement agent.
Given the policy and the case, return only valid JSON:
{
  "decision": "approve" | "deny" | "escalate",
  "reason": "string",
  "path": [
    { "step": "check_amount", "type": "code", "result": "passed" },
    { "step": "vendor_judgment", "type": "model", "result": "..." }
  ]
}
```

## Partner stacks (integrate as real parts of the flow)
- **Dolphin**: Use as the open-model backend for judgment steps when possible (OpenAI-compatible endpoint). Fallback to SERV catalog models is fine.
- **Kite**: Represent identity + hard spending limits. If live kpass setup is too slow, implement a clear stub that shows the limit check in the path and note it in the write-up.
- **Reppo**: After the decision, call the Evaluation API to score the outcome. Display the score. Store the evalId.

## Must-have for the demo
- One policy
- Case form
- Visible path / step list (code vs model)
- Decision output
- Reppo score
- Re-run that reflects feedback or shows history
- Clean README with setup instructions
- .env.example

## Do not do
- Multi-user auth
- Live on-chain payments
- Fancy graph visualization library (simple list or Mermaid is enough)
- Over-engineering

## Files to produce
- Working Next.js app
- README.md
- .env.example
- Short write-up draft for the submission form

Start by scaffolding the app and the SERV call. Make the core loop work before any polish.
