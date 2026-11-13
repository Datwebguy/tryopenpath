# Openpath

A console that lets you define a policy for an AI agent, run a case, and see the exact path the decision took.

Built for SERV Hackathon Edition 02.

## What it does
- Define or select a policy (invoice / expense approval demo included)
- Submit a case
- SERV Reasoning produces a structured decision + step-by-step path
- Hard checks (limits, required fields) run as code; judgment steps call a model
- Kite-style identity and spending limits are enforced (or clearly stubbed)
- Reppo Evaluation API scores the outcome
- Re-run the same case and see feedback affect the result

## Quick start
1. Clone the repo
2. `cp .env.example .env.local` and fill in keys
3. `npm install`
4. `npm run dev`

## Environment variables
```
SERV_API_KEY=
DOLPHIN_API_KEY=          # optional
REPPO_API_KEY=
KITE_STUB_LIMIT=500       # demo limit in USD
```

## Demo flow
1. Open the app
2. Use the default invoice policy
3. Enter a case (try one under the limit and one over)
4. View the decision and the path (code steps vs model steps)
5. See the Reppo score
6. Re-run after feedback

## Hackathon notes
- Public repo required
- Tag @openservai on X
- Submission form: https://openserv.typeform.com/submissions02
- Deadline: 15 November 2026, 23:59 UTC

## Author
[Your name / handle]
