<p align="center">
  <img src="docs/images/banner.svg" alt="Openpath: see the exact path every agent decision takes" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Datwebguy/tryopenpath/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-4338ca"></a>
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-0f1729">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6">
  <img alt="SERV Hackathon Edition 02" src="https://img.shields.io/badge/SERV%20Hackathon-Edition%2002-6d28d9">
</p>

<h3 align="center">Write a policy once. Run a case. See every step of the decision, scored and ready to improve the next run.</h3>

<p align="center">
  <img src="docs/images/06-rerun-feedback.png" alt="Openpath console showing an approved decision, its full path, and a Reppo score of 99" width="100%">
</p>

---

## What Openpath does

Openpath is a console for agent decisions. You describe a policy in plain language, add the exact rules that must never bend, and run real cases through it. Every case produces a decision and the **complete path** behind it.

| | |
|---|---|
| **Hard rules in code** | Spending limits, PO matching, vendor lists and field checks run as plain code. Same input, same answer, no model involved. |
| **Judgment on a model** | The model is called only for the part that needs judgment, such as reading notes for anything unusual. |
| **Every step on record** | Each step is labeled code or model, with its result, its timing, and which model answered. |
| **Scored by Reppo** | Independent evaluators score each decision and explain the score. |
| **Feedback that sticks** | The stored score and critique feed the next run of the same case, so you can see the improvement. |

## How it works

<p align="center">
  <img src="docs/images/architecture.svg" alt="Architecture: policy and case flow through hard rules in code, then a model judgment, producing a decision that Reppo scores and stores for the next run" width="100%">
</p>

1. **Write a policy.** Plain language for the model, plus an exact spending limit, approved vendors and known PO numbers for the code checks.
2. **Run a case.** Enter an amount, vendor, PO number and notes.
3. **Hard rules run first.** If a rule decides the case, the decision is made by code and the model step is skipped.
4. **The model judges what is left.** Dolphin runs first when it is set up, and SERV Reasoning answers whenever Dolphin is not available.
5. **See the decision and its path.** Approve, deny or escalate, with a plain reason.
6. **Reppo scores it.** Usually within 30 to 90 seconds.
7. **Run it again.** The stored feedback is part of the next run, and the console shows the score change.

## A tour of the console

### Start with a policy
Tag inputs make vendor and PO lists quick to build. Everything you save is stored with your data, so the console starts from your rules.

<p align="center"><img src="docs/images/02-policy.png" alt="Policy editor with plain-language text, a spending limit, and vendor and PO tags" width="92%"></p>

### Watch the path unfold
Code steps and model steps are visually distinct. The model step shows which provider answered and how long it took.

<p align="center"><img src="docs/images/03-decision-path.png" alt="Decision path with five code steps and one model call" width="92%"></p>

### Get an independent score
Reppo returns an overall score, a route, a written reason, and a breakdown per dimension.

<p align="center"><img src="docs/images/04-score.png" alt="Reppo score card with a ring chart and per-dimension bars" width="92%"></p>

### Hard rules decide on their own
When a rule decides a case, the model is skipped and the path says exactly why.

<p align="center"><img src="docs/images/05-denied-by-rule.png" alt="A denied decision where the model step is skipped" width="92%"></p>

### Built for your phone too
<p align="center"><img src="docs/images/07-mobile.png" alt="Openpath on a phone" width="300"></p>

## The partner stack

| Partner | Role in Openpath |
|---|---|
| **SERV Reasoning** (OpenServ) | Judgment step through `/v1/chat/completions`, with a system prompt on every request. Pick any chat model from the SERV catalog. |
| **Dolphin** | Open-model inference for the judgment step. Runs first when `DOLPHIN_API_KEY` and `DOLPHIN_MODEL` are set. |
| **Reppo** | Scores every decision through the Evaluation API. Scores and critiques are stored and used on the next run. |
| **Kite Passport** | Adds identity and session spending-limit checks to the path when the `kpass` CLI is connected. |

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
| Dolphin | [app.dphn.ai](https://app.dphn.ai): verify your wallet, redeem credits, then **API Keys → Create Key**. List models with `GET https://lighthouse.dphn.ai/run/text-v/v1/models`. |
| Reppo | [eval.reppo.xyz](https://eval.reppo.xyz): sign in, then **API Key → Generate**. |

## Configuration

| Variable | Purpose |
|---|---|
| `SERV_API_KEY`, `SERV_MODEL` | SERV Reasoning key and the chat model id to use, for example `serv-mini`. |
| `DOLPHIN_API_KEY`, `DOLPHIN_MODEL` | Optional. When both are set, Dolphin runs the judgment step first. |
| `JUDGE_PROVIDER` | Set to `serv` to try SERV before Dolphin. |
| `REPPO_API_KEY` | Enables scoring and the feedback loop. |
| `KPASS_BIN` | Optional. Path to the `kpass` CLI to add Kite Passport checks. |
| `OPENPATH_DATA_DIR` | Where policy and history are stored. Defaults to `.data` in the project. |

The integrations bar at the top of the console shows which services are active.

### Adding Kite Passport

Install the CLI, sign in, and approve a spending session:

```bash
curl -fsSL https://cli.gokite.ai/install.sh | bash
kpass login init --email you@example.com
kpass login verify --login-id <LOGIN_ID> --code <CODE_FROM_EMAIL>
kpass agent:session create --task-summary "Openpath invoice review" \
  --max-amount-per-tx 500 --max-total-amount 2000 --ttl 24h --assets USDC --payment-approach x402_http
```

Then set `KPASS_BIN` to the `kpass` path. Every case now includes a `Kite identity` step and a `Kite session limit` step.

## Deploy on Railway

1. Create a service from this repository.
2. Add a **volume** and mount it at `/data`.
3. Set the variables: `OPENPATH_DATA_DIR=/data`, `SERV_API_KEY`, `SERV_MODEL`, `REPPO_API_KEY`, and optionally `DOLPHIN_API_KEY` and `DOLPHIN_MODEL`.
4. Deploy. Railway sets `PORT`, and `npm start` uses it.

The volume keeps your policy, history and scores across deploys.

## Project structure

```
app/
  page.tsx                 The console
  components/              Policy editor, case form, path graph, score card, history
  api/decide               Runs the path for a case
  api/evaluate             Submits a decision to Reppo and polls the score
  api/policy               Reads and saves the policy
  api/history              Lists saved runs
  api/status               Which integrations are active
lib/
  checks.ts                Hard rules that run as code
  judge.ts                 Judgment step (Dolphin first, SERV Reasoning)
  reppo.ts                 Reppo Evaluation API client
  kite.ts                  Kite Passport checks through kpass
  policy.ts  history.ts    Saved policy and run history
docs/                      Product, architecture and submission documents
```

## API

| Endpoint | Description |
|---|---|
| `POST /api/decide` | Body: `{ amount, vendor, invoiceNumber, notes }`. Returns the decision, reason and path. |
| `POST /api/evaluate` | Body: `{ case, decision }`. Submits to Reppo and returns an `evalId`. |
| `GET /api/evaluate/:evalId` | Returns the live status and score. |
| `GET` / `PUT /api/policy` | Read or save the policy. |
| `GET /api/history` | Saved runs, newest first. |

## Documentation

- [Project overview](docs/PRJ.md) · [Product](docs/PRODUCT.md) · [Architecture](docs/ARCHITECTURE.md)
- [Build brief](docs/AGENT_PROMPT.md) · [Plan](docs/PLAN.md) · [Resources](docs/RESOURCES.md) · [Submission](docs/SUBMISSION.md)

## Built for SERV Hackathon Edition 02

Tracks: **Kite**, **Reppo**, **Open**, with **Dolphin** as the open-model backend.
[Submission form](https://openserv.typeform.com/submissions02)

## Author

Built by [Datwebguy](https://github.com/Datwebguy).

## License

[MIT](LICENSE)
