# Openpath — Submission Draft

## Project name
Openpath

## Tracks
Kite, Reppo, Open (Dolphin used for open-model judgment steps)

## What it does
Openpath is a console that lets anyone define a policy for an AI agent and see the exact path every decision takes. Hard rules and spending limits run as code. Judgment steps call a model only when needed. The full path is visible, the outcome is scored, and the score improves the next run.

## How SERV Reasoning is used
Every case is sent to the SERV Reasoning API with a system prompt that forces a structured decision plus an explicit step-by-step path. The path distinguishes code steps (limits, field checks) from model steps. This gives the inspectable, bounded reasoning OpenServ describes with Graph Sharding.

## Partner usage
- **Kite**: Identity and hard spending limits gate payment-related decisions.
- **Reppo**: Every decision is submitted to the Evaluation API. The score and feedback are stored and used on the next run of the same case.
- **Dolphin**: Open-model inference for judgment nodes (or SERV catalog fallback).

## Demo
[Link to deployed demo or video]

## Repo
[GitHub link]

## X post
[Link to post tagging @openservai]
