# Openpath — Product

## Name
**Openpath**

## What it is
A console that gives anyone a clear, permanent path through every decision an AI agent makes under a policy.

You write the rules once. You run a case. You see exactly what happened: which steps ran as code, which steps called a model, why the model was called, what limits were checked, and what the final decision was. After the result, the decision is scored. The score and feedback are kept so the next run of the same case can be tighter.

## Who uses it
- Individuals who want an agent to spend or approve things with hard limits and a visible trail instead of blind trust.
- Solo builders and freelancers who need to show a client or themselves exactly why an agent approved or rejected something.
- Small groups or companies that want agents handling invoices, expenses, or access but must be able to prove the reasoning and change one step without rebuilding the agent.
- Anyone testing an agent before it touches real money or real decisions.

## Core user journey
1. Define or pick a policy (plain language).
2. Submit a case.
3. Watch the path execute and see the decision + full trace.
4. Give or receive feedback / evaluation score.
5. Re-run and see the improvement.

## Policy example (demo)
**Invoice approval**  
“Approve the payment only if the amount is under the user-set limit, the invoice number matches a known PO, and the vendor is on the approved list. Otherwise deny and give the exact reason.”

## What makes a decision inspectable
- Explicit graph of steps.
- Script/code nodes for hard rules, math, field checks, and limits (no model call).
- Model nodes only where judgment is required (powered by open models via Dolphin or SERV catalog).
- Every path logged.
- Identity and spending caps enforced via Kite Passport.
- Outcome scored via Reppo Evaluation API; score feeds the next run.

## Tracks it can enter
- **Kite** — verifiable identity + controlled spending limits.
- **Reppo** — real-time feedback turned into measurable improvement.
- **Open** — any domain; SERV Reasoning is the core.
- **Dolphin** — open-model inference for judgment nodes (optional but strong).

## Success criteria for the hackathon
A judge can open the demo, submit a case, see the full path, understand why the decision was made, and see a second run that reflects feedback. The write-up clearly shows SERV Reasoning usage and the partner integrations.
