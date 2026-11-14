# Openpath: Build Brief

The working agreement for anyone building on Openpath, human or tool-assisted.

## Ground rules
- The human builder is the sole author of every file, commit message, README and `package.json`.
- Real data only. No sample vendors, invoice numbers, limits, scores or model names in the code. Values come from the user's saved policy, their cases, their environment, or a live service.
- Light theme, clear flow, purposeful animation, and a layout that works on a phone.
- Wording stays constructive and specific. Say what the product does.
- Readable code over clever code. Small files with one job each.

## What Openpath is
A console where anyone writes a policy, runs a case, and sees the exact path the decision took.

## Core loop
1. Save a policy: plain-language text, a spending limit, approved vendors, known PO numbers.
2. Submit a case: amount, vendor, invoice number, notes.
3. Hard rules run as code. A rule that decides the case skips the model step.
4. The judgment step runs on SERV Reasoning and returns structured JSON.
5. Vendor bank accounts on file are compared with the invoice, and a change holds the payment.
6. The decision and path are shown and saved.
7. Reppo scores the decision, and the score is stored and shown.
8. Running the same case again includes the stored feedback and shows the change.

## Stack
- Next.js (App Router) and TypeScript, with plain CSS
- Server routes for SERV and Reppo calls
- Environment variables for every key and model id

## Integrations
- **SERV Reasoning:** the core of the judgment step. `https://inference-api.openserv.ai/v1/chat/completions`, Bearer auth, a system prompt on every request.
- **Reppo:** `https://eval.reppo.xyz/api/v1/agents/evals`, follow https://eval.reppo.xyz/agents.md.

## Files
- Working Next.js app
- `README.md`, `.env.example`, `LICENSE`
- `docs/` with product, architecture, resources and the submission write-up
