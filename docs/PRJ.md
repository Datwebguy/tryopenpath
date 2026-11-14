# Openpath: Project Overview

**Hackathon:** SERV Hackathon, Edition 02
**Organizer:** OpenServ ([@openservai](https://x.com/openservai))
**Deadline:** November 15, 2026, 23:59 UTC
**Prize pool:** $5,000
**Tracks:** Reppo, Open

## In one line
Openpath stops invoice fraud before an AI agent pays. It is a console where anyone writes a policy for an AI agent, runs a case through it, and sees the exact path the decision took, with exact limits enforced every time, AI judgment where judgment is needed, and a feedback score that shapes the next run.

## The core loop
1. Write a policy: plain words for the AI, plus an exact spending limit, approved vendors and known PO numbers.
2. Optionally add rules in plain sentences. SERV Reasoning turns each one into an exact rule.
3. Submit a case: amount, vendor, invoice or PO number, and notes.
4. Fixed rules run first. If a rule decides the case, the AI step is skipped.
5. The judgment step runs on SERV Reasoning.
6. A changed bank account holds the payment before any AI is asked.
7. The console shows the decision and the full path, and any run can be shared with a link.
8. Reppo's Evaluation API scores the decision. The score and critique are stored.
9. Running the same case again carries that feedback forward, shows the score change, and adds a point to the score chart.

## Why it fits OpenServ's direction
- It maps a workflow into explicit steps and shows why every decision happened.
- Each step is controlled: rules are code, judgment is a model call, and the boundary is visible.
- Every partner integration is part of the working flow.
- It serves individuals, solo builders, freelancers and teams.

## Submission checklist
- [x] Public GitHub repository
- [x] Working console with the full loop
- [ ] Data collection enabled in the OpenServ organization settings: https://console.openserv.ai/settings/organization
- [x] Live demo: https://openpath.up.railway.app
- [ ] Short demo video (script in [DEMO.md](DEMO.md))
- [ ] Write-up: see [SUBMISSION.md](SUBMISSION.md)
- [ ] X post tagging @openservai
- [ ] Submission form: https://openserv.typeform.com/submissions02

## Environment
- The project is built to be developed from a phone as well as a desktop.
- Configuration lives in environment variables. See `.env.example`.
