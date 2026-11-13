# Openpath: Submission

## Project name
Openpath

## Tracks
Kite, Reppo and Open.

## What it does
Openpath is a console where anyone writes a policy for an AI agent and sees the exact path every decision takes. Hard rules and spending limits run as code. The judgment step calls a model only where judgment is needed. The full path is visible, the outcome is scored by independent evaluators, and the score and critique shape the next run of the same case.

## How SERV Reasoning is used
SERV Reasoning powers the judgment step. After the code checks clear a case, the policy, the case and any stored feedback go to SERV through `/v1/chat/completions` with a system prompt that asks for a structured JSON decision. The path labels every step as `code` or `model`, shows which model answered and how long it took, and records when a hard rule already decided the case so the model step is skipped. That gives the inspectable, bounded reasoning OpenServ describes with Graph Sharding: each step is separate, controlled and on the record.

## Partner usage
- **Kite:** the `kpass` CLI adds identity, per-transaction limit, remaining session budget and expiry checks to the path.
- **Reppo:** every decision is submitted to the Evaluation API. The score, route, reason and rubric scores are stored and used on the next run of the same case, and the console shows the score change.

## Real data throughout
Policy text, spending limit, vendors and PO numbers come from the user. Scores come from Reppo. Decisions come from live model calls. History is stored on disk.

## Demo
Add the deployed link or video URL here.

## Repository
https://github.com/Datwebguy/tryopenpath

## X post
Add the link to the post tagging @openservai here.

## Before submitting
- Enable data collection in the OpenServ organization settings so OpenServ can verify the project's use of SERV: https://console.openserv.ai/settings/organization
- Post the project on X and tag @openservai.

## Submission form
https://openserv.typeform.com/submissions02
