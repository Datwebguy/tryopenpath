# Openpath: Submission

## Project name
Openpath

## One line
Guardrails you can prove, for AI that approves payments.

## Tracks
Kite, Reppo and Open.

## Live demo
https://openpath.up.railway.app

## Repository
https://github.com/Datwebguy/tryopenpath

## What it does
AI agents are starting to approve invoices and payments. When one says yes, nobody can see why, or prove the rules were followed. Openpath puts every decision on a path you can inspect.

- **Rules the AI cannot override.** Spending limits, known POs, approved vendors and the owner's own rules are checked exactly, every time. When a rule decides, the AI is never asked, so it cannot be talked into a yes.
- **AI only for judgment.** SERV Reasoning reads what rules cannot, such as notes that sound like fraud. It treats those notes as untrusted text and never follows instructions inside them.
- **Every call scored.** Reppo's independent evaluators score each decision. The score and critique feed the next run of the same case, and any run can be shared as proof.

## See it in action
Real runs on the live site:

| What happens | Result | Decided by | Reppo |
|---|---|---|---|
| [A routine invoice, approved](https://openpath.up.railway.app/run/bd115604e0) | Approved | SERV Reasoning | 96/100 |
| [Over the limit, stopped by a rule](https://openpath.up.railway.app/run/d3094b7e92) | Denied | A rule. The AI is never asked. | 100/100 |
| [Notes that sound like fraud, sent to a person](https://openpath.up.railway.app/run/2f7d7d0e64) | Sent to a person | SERV Reasoning | 100/100 |
| [An attack hidden in the notes, caught](https://openpath.up.railway.app/run/ec659067be) | Sent to a person | SERV Reasoning refused the instruction | 100/100 |
| [A rule written in plain English](https://openpath.up.railway.app/run/5f08fb059c) | Sent to a person | The owner's own rule. The AI is never asked. | 100/100 |

## How SERV Reasoning is used
SERV Reasoning does two jobs.

1. **It writes rules from plain English.** The owner types a sentence such as "Send anything over 2000 dollars from a vendor we have not used before to review". SERV returns a structured rule, Openpath shows how it understood it ("When the amount is over $2,000 and the vendor is new, send it to a person"), and the rule is then enforced as data, the same way every time.
2. **It makes the judgment call.** After the rules clear a case, the policy, the case and any stored feedback go to SERV through `/v1/chat/completions`, with a system prompt that asks for a structured decision and marks the case notes as untrusted.

The path labels every step as a rule or AI, shows which model answered and how long it took, and records when a rule already decided the case. That is the inspectable, bounded reasoning OpenServ describes with Graph Sharding: each step is separate, controlled and on the record.

## Partner usage
- **Reppo:** every decision is submitted to the Evaluation API, together with the policy and the owner's rules. The score, route, reason and rubric scores are saved, fed into the next run of the same case, and shown as a score change and a chart.
- **Kite:** Openpath runs the `kpass` CLI to add identity, per-transaction limit, remaining session budget and expiry checks to the path once Kite Passport is connected on the server.

## Built to be trusted
Each visitor works in a private workspace, the server saves every run itself, inputs are validated, routes are rate limited, and the page ships with strict browser security headers. Details: https://github.com/Datwebguy/tryopenpath/blob/main/SECURITY.md

## Demo video
Add the video link here after recording. The script is in docs/DEMO.md.

## X post
Add the link to the post here. The draft is in docs/DEMO.md.

## Before submitting
- Enable data collection in the OpenServ organization settings so OpenServ can verify the project's use of SERV: https://console.openserv.ai/settings/organization
- Post the project on X and tag @openservai.

## Submission form
https://openserv.typeform.com/submissions02
