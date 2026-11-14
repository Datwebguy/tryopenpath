<p align="center">
  <img src="docs/images/banner.svg" alt="Openpath: see the exact path every agent decision takes" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Datwebguy/tryopenpath/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-4338ca"></a>
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-0f1729">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6">
  <img alt="SERV Hackathon Edition 02" src="https://img.shields.io/badge/SERV%20Hackathon-Edition%2002-6d28d9">
  <a href="https://openpath.up.railway.app"><img alt="Live demo" src="https://img.shields.io/badge/live%20demo-openpath.up.railway.app-15803d"></a>
</p>

<h3 align="center">Stop invoice fraud before your AI agent pays.</h3>

<p align="center"><b><a href="https://openpath.up.railway.app">Try it live: openpath.up.railway.app</a></b></p>

<p align="center">
  <img src="docs/images/00-landing.png" alt="The Openpath landing page: the problem, three ideas, and buttons to see it in action or try it" width="100%">
</p>

---

## What Openpath does

Fraudsters already target whoever pays the invoices: a changed bank account, an urgent message from the "CEO", a note telling the reviewer to skip checks. Now AI agents pay invoices too, and an AI can be talked into a yes.

**Openpath sits between the agent and the money.** It is built for small finance teams, bookkeepers, and anyone building an AI agent that pays bills.

Openpath is a console for AI payment decisions. You describe a policy in plain words, set the exact limits that must never bend, and run real cases through it. Every case produces a decision and the **complete path** behind it.

| | |
|---|---|
| **Catches changed bank details** | Keep each vendor's bank account on file. If an invoice asks to be paid somewhere else, the payment is held before money moves, with no AI involved. |
| **Rules in your own words** | Write a rule as a sentence. SERV Reasoning turns it into an exact rule you can read, and it runs the same way every time. |
| **Fixed rules, checked exactly** | Spending limits, PO numbers, vendor lists and required fields are checked the same way every time. Same case, same answer. |
| **AI judgment where it counts** | The AI steps in only for what needs judgment, such as reading the notes for anything unusual. |
| **Every step on record** | Each step is labeled Rule or AI, with its result, its timing, and which AI answered. |
| **Scored by Reppo** | Independent evaluators score each decision and explain why. |
| **Feedback that sticks** | The score and critique are saved and shape the next run of the same case, so you see the improvement. |
| **Shareable runs** | Send a link to any run. It opens a read-only page with the decision, the path and the live score. |

## See it in action

These are real runs on the live site, with real SERV Reasoning calls and real Reppo scores. Click any one to see its full path.

| What happens | Result | Decided by | Reppo |
|---|---|---|---|
| [Bank details changed, payment held](https://openpath.up.railway.app/run/b492a4e982) | Held for a person | Bank account check. The AI is never asked. | 100/100 |
| [A fake urgent request from the CEO, caught](https://openpath.up.railway.app/run/2f7d7d0e64) | Sent to a person | SERV Reasoning | 100/100 |
| [An attack hidden in the notes, caught](https://openpath.up.railway.app/run/ec659067be) | Sent to a person | SERV Reasoning refused the instruction | 100/100 |
| [Over the limit, stopped by a rule](https://openpath.up.railway.app/run/d3094b7e92) | Denied | A rule. The AI is never asked. | 100/100 |
| [A rule written in plain English](https://openpath.up.railway.app/run/5f08fb059c) | Sent to a person | The owner's own rule. The AI is never asked. | 100/100 |
| [A routine invoice, approved](https://openpath.up.railway.app/run/bd115604e0) | Approved | SERV Reasoning | 96/100 |

<p align="center"><img src="docs/images/11-showcase.png" alt="The showcase of real runs on the live site" width="100%"></p>

## How it works

<p align="center">
  <img src="docs/images/architecture.svg" alt="How Openpath works: a policy and a case go through fixed rules, then an AI judgment, producing a decision that Reppo scores and saves for the next run" width="100%">
</p>

1. **Write a policy.** Plain words for the AI, plus an exact spending limit, approved vendors and known PO numbers.
2. **Add rules in your own words.** Optional. SERV Reasoning turns each sentence into an exact rule and shows you how it understood it.
3. **Run a case.** Enter an amount, vendor, PO number and notes.
4. **Fixed rules run first.** Yours and the built-in ones. If a rule decides the case, the decision is made right there and the AI step is skipped.
5. **SERV Reasoning judges the rest.** It reads the notes against your policy and answers approve or escalate, with a plain reason.
6. **See the decision and its path.** Approve, deny or escalate, with a plain reason.
7. **Reppo scores it.** Usually within 30 to 90 seconds.
8. **Run it again, or share it.** The saved feedback joins the next run, and the console shows how the score changed. Share any run with a link.

## A tour of the console

### Start with a policy, then add rules in your own words
Vendor and PO lists are quick to build, and each vendor's bank account can be kept on file so a changed account is caught. Write a rule as a sentence and SERV Reasoning turns it into an exact rule, shown in plain language before you save.

<p align="center"><img src="docs/images/02-policy.png" alt="Policy editor with vendor and PO tags, vendor bank accounts on file, and a rule written in plain words shown with how SERV understood it" width="60%"></p>

Rules can use the amount, the vendor, the PO number, the notes, the day of the week, and how many earlier runs the vendor has. Each rule can deny a case or send it to a person.

### Watch the path unfold
Rule checks and AI judgment look different at a glance. The AI step shows which model answered and how long it took.

<p align="center"><img src="docs/images/03-decision-path.png" alt="Decision path with six rule checks and one AI judgment" width="92%"></p>

### Get an independent score
Reppo returns an overall score, a route, a written reason, and a breakdown per dimension.

<p align="center"><img src="docs/images/04-score.png" alt="Reppo score card with a ring chart and per-dimension bars" width="92%"></p>

### Your rules can decide a case
Here a rule written in plain words sends a first-time vendor's large invoice to a person. The AI step is skipped, and the path says exactly why.

<p align="center"><img src="docs/images/08-rule-decides.png" alt="An escalated decision made by a plain-language rule, with the AI judgment skipped" width="92%"></p>

Built-in checks decide on their own too, such as a spending limit:

<p align="center"><img src="docs/images/05-denied-by-rule.png" alt="A denied decision where the AI judgment is skipped" width="92%"></p>

### Watch the score move
Run the same case again and the saved feedback joins the next run. The chart shows how the score moved across runs, using real scores only.

<p align="center"><img src="docs/images/10-trend.png" alt="Score across runs of the same case" width="80%"></p>

### Share a run
Every run has a link. It opens a read-only page with the decision, the path and the score.

<p align="center"><img src="docs/images/09-shared-run.png" alt="A shared run page" width="70%"></p>

### Built for your phone too
<p align="center"><img src="docs/images/07-mobile.png" alt="Openpath on a phone" width="300"></p>

## The partner stack

| Partner | Role in Openpath |
|---|---|
| **SERV Reasoning** (OpenServ) | The core of Openpath. It writes your plain-language rules as exact rules, and it makes every AI judgment, using any chat model from the SERV catalog. |
| **Reppo** | Scores every decision. Scores and critiques are saved and used on the next run. |

## Quick start

```bash
git clone https://github.com/Datwebguy/tryopenpath.git
cd tryopenpath
cp .env.example .env.local     # add your keys
npm install
npm run dev                    # http://localhost:3000
```

Open the console, write your first policy, and run a case.

### Getting your keys

| Service | Where to get it |
|---|---|
| SERV | [console.openserv.ai](https://console.openserv.ai). List chat models with `GET https://inference-api.openserv.ai/v1/models`. |
| Reppo | [eval.reppo.xyz](https://eval.reppo.xyz): sign in, then **API Key → Generate**. |

## Configuration

| Variable | Purpose |
|---|---|
| `SERV_API_KEY`, `SERV_MODEL` | Your SERV key and the model to use, for example `serv-mini`. |
| `SERV_RULES_MODEL` | Optional. A different SERV model for turning rule sentences into rules. Defaults to `SERV_MODEL`. |
| `REPPO_API_KEY` | Enables scoring and the feedback loop. |
| `OPENPATH_DATA_DIR` | Where your policy and history are saved. Defaults to `.data` in the project. |

The integrations bar at the top of the console shows which services are active.

## Deploy on Railway

1. Create a service from this repository.
2. Add a **volume** and mount it at `/data`.
3. Set the variables: `OPENPATH_DATA_DIR=/data`, `SERV_API_KEY`, `SERV_MODEL`, `REPPO_API_KEY`.
4. Deploy. Railway sets `PORT`, and `npm start` uses it.

The volume keeps your policy, history and scores across deploys.

## Documentation

- [Project overview](docs/PRJ.md) · [Product](docs/PRODUCT.md) · [Architecture and routes](docs/ARCHITECTURE.md)
- [Build brief](docs/AGENT_PROMPT.md) · [Plan](docs/PLAN.md) · [Resources](docs/RESOURCES.md) · [Submission](docs/SUBMISSION.md) · [Demo script](docs/DEMO.md)

## Security

Each visitor works in a private workspace, runs are saved by the server, every route validates its input and is rate limited, and the page ships with strict browser protections. The AI is told to treat notes as untrusted text, and rules are exact data that can never run as code. Read the details in [SECURITY.md](SECURITY.md).

## Built for SERV Hackathon Edition 02

Tracks: **Reppo** and **Open**.
[Submission form](https://openserv.typeform.com/submissions02)

## Author

Built by [Datwebguy](https://github.com/Datwebguy).

## License

[MIT](LICENSE)
