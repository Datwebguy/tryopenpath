# Openpath: Project Overview

**Hackathon:** SERV Hackathon, Edition 02
**Organizer:** OpenServ ([@openservai](https://x.com/openservai))
**Deadline:** November 15, 2026, 23:59 UTC
**Prize pool:** $5,000
**Tracks:** Kite, Reppo, Open, with Dolphin as the open-model backend

## In one line
Openpath is a console where anyone writes a policy for an AI agent, runs a case through it, and sees the exact path the decision took, with hard limits enforced in code, open-model judgment where judgment is needed, and a feedback score that shapes the next run.

## The core loop
1. Write a policy: plain language for the model, plus an exact spending limit, approved vendors and known PO numbers for the code checks.
2. Submit a case: amount, vendor, invoice or PO number, and notes.
3. Hard rules run as code. If a rule decides the case, the model step is skipped.
4. The judgment step runs on an open model through Dolphin, or on SERV Reasoning.
5. Kite Passport identity and session limits join the path when the `kpass` CLI is connected.
6. The console shows the decision and the full path.
7. Reppo's Evaluation API scores the decision. The score and critique are stored.
8. Running the same case again carries that feedback forward and shows the score change.

## Why it fits OpenServ's direction
- It maps a workflow into explicit steps and shows why every decision happened.
- Each step is controlled: rules are code, judgment is a model call, and the boundary is visible.
- Every partner integration is part of the working flow.
- It serves individuals, solo builders, freelancers and teams.

## Submission checklist
- [x] Public GitHub repository
- [x] Working console with the full loop
- [ ] Deployed demo link or short video
- [ ] Write-up: see [SUBMISSION.md](SUBMISSION.md)
- [ ] X post tagging @openservai
- [ ] Submission form: https://openserv.typeform.com/submissions02

## Environment
- The project is built to be developed from a phone as well as a desktop.
- Configuration lives in environment variables. See `.env.example`.
