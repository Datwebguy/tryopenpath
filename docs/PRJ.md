# Openpath — Project Overview

**Hackathon:** SERV Hackathon — Edition 02  
**Organizer:** OpenServ (@openservai)  
**Deadline:** November 15, 2026, 23:59 UTC  
**Prize pool:** $5,000  
**Tracks:** Can target multiple (Kite + Reppo + Open recommended; Dolphin as inference backend)

## One-line description
Openpath is a console that lets anyone define a policy for an AI agent, run a case through it, and see the exact path the decision took — with hard limits enforced, open-model judgment where needed, and a feedback score that improves the next run.

## Core loop (must be demoable)
1. User defines or selects a policy in plain language (example: invoice/expense approval).
2. User submits a case (structured data or text).
3. System compiles the policy into an explicit reasoning graph via SERV Reasoning.
4. Graph executes: script/code nodes for hard rules and limits; model nodes (via Dolphin or SERV catalog) only for judgment.
5. Kite Passport identity + spending limits gate any payment-related action.
6. Decision + full path (trace) is shown.
7. Reppo Evaluation API scores the outcome; feedback is stored and affects the next identical case.

## Why this wins
- Directly answers OpenServ’s stated ask: map workflows, inspect why every decision happens, control each step (Graph Sharding style).
- Integrates the partner stacks as required pieces, not optional add-ons.
- Complete, visible end-to-end loop matching patterns of winners across agent hackathons.
- Works for individuals, solo builders, freelancers, or teams.

## Minimal viable demo (priority for remaining time)
- One predefined policy (invoice or expense approval).
- One case input form.
- Visible graph / step list showing code vs model nodes.
- SERV Reasoning call with system prompt that produces a structured decision + reasoning summary.
- Stub or real Kite limit check.
- One Reppo evaluation submit + score display.
- Re-run button that shows a different path or score after feedback.
- Public repo + short write-up + X post.

## What to defer
- Live on-chain payment execution
- Multi-user accounts / roles
- Full visual graph editor
- Multiple policies library
- Production auth

## Submission requirements
- Public GitHub repo
- Demo link or video
- Short write-up explaining the project, how SERV Reasoning is used, and which track(s)
- X post tagging @openservai with link in the form
- Form: https://openserv.typeform.com/submissions02

## Environment notes
- Builder is phone-first (Replit Agent, Claude, etc.).
- OpenServ API key available (credits from registration emails).
- Focus on clear, readable code and a working demo over feature count.
