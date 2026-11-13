# Openpath: Architecture

## Overview
A Next.js (App Router, TypeScript) application with one flow: policy and case, hard rules, model judgment, a visible path, a Reppo score, and stored feedback.

![Architecture](images/architecture.svg)

## Frontend
- **Policy card:** plain-language text, a spending limit, and tag inputs for vendors and PO numbers.
- **Case form:** amount, invoice or PO number, vendor and notes, with suggestions from the saved lists.
- **Decision and path:** the decision, the reason, and each step labeled `code` or `model` with its result and timing.
- **Score card:** the overall Reppo score, route, reason, and per-dimension bars, with the change from the previous run.
- **History:** every saved run, openable for review.
- **Integrations bar:** which services are active.

## Server routes
| Route | Purpose |
|---|---|
| `POST /api/decide` | Runs the hard checks, loads stored feedback, calls the judgment step when needed, and returns the decision and path. |
| `POST /api/evaluate` | Submits a finished decision to Reppo as an `action` and stores the run. |
| `GET /api/evaluate/:evalId` | Reads the Reppo evaluation and stores the settled score on the run. |
| `GET` / `PUT /api/policy` | Reads and saves the policy. |
| `GET /api/history` | Lists saved runs. |
| `GET /api/status` | Reports which integrations are active, as yes or no values only. |

## Steps in a path
1. `parse_case`: required fields and numbers.
2. `policy_spending_limit`: amount against your limit.
3. `po_match` and `vendor_allowlist`: against your saved lists.
4. `kite_identity` and `kite_session_limit`: added when `KPASS_BIN` is set.
5. `load_feedback`: the stored Reppo score for the same case.
6. `model_judgment`: skipped when a rule already decided the case.

```json
{
  "decision": "deny",
  "reason": "Denied by rule: policy spending limit",
  "ms": 12,
  "path": [
    { "step": "parse_case", "type": "code", "result": "ok" },
    { "step": "policy_spending_limit", "type": "code", "result": "failed" },
    { "step": "model_judgment", "type": "model", "result": "skipped" }
  ]
}
```

## Judgment
`lib/judge.ts` sends every judgment to SERV Reasoning through chat completions, with a system prompt on every request. The answer is structured JSON: approve or escalate, with a reason. The path records which SERV model answered and how long it took. If SERV does not answer, the case is escalated to a person.

## Reppo
`lib/reppo.ts` follows the Evaluation API guide at https://eval.reppo.xyz/agents.md. A decision is submitted with `taskType: "action"`, and the status moves from `QUEUED` and `PROCESSING` to `COMPLETED`. The score, route, reason and rubric scores are stored with the run.

## Kite Passport
`lib/kite.ts` runs the `kpass` CLI with `--output json --no-interactive`, because Kite publishes its Passport interface as a CLI. `kpass me` confirms identity. `kpass agent:session list --status active` (or `kpass user sessions --status active`) returns the active session with `max_amount_per_tx`, `max_total_amount`, `spent_total`, `reserved_total` and `expires_at`. The amount must fit the per-transaction limit and the budget left, and the session must not have expired. Errors arrive as JSON with a `hint`, which the path shows.

## Storage
`lib/storage.ts` writes `policy.json` and `history.json` to `OPENPATH_DATA_DIR`, which defaults to `.data` in the project. On Railway, mount a volume and point the variable at it.

## Feedback loop
```
Run a case → path + decision → Reppo score → saved with the run
        ↑                                          │
        └──── next run of the same case reads it ──┘
```
Cases are matched by vendor, PO number and amount.
