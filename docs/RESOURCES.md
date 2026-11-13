# Openpath: Resources

Primary sources for SERV Hackathon Edition 02 and the partner stacks.

## Hackathon
- Official page: https://www.openserv.ai/hackathon-2
- Submission form: https://openserv.typeform.com/submissions02
- OpenServ on X: https://x.com/openservai
- Previous edition: https://www.openserv.ai/hackathon
- Partner credits for the Reppo and Dolphin tracks: join https://t.me/openservai and message a community lead with your track.

## SERV Reasoning
- What is SERV: https://docs.openserv.ai/what-is-serv
- Quickstart: https://docs.openserv.ai/serv-reasoning/introduction
- API overview: https://docs.openserv.ai/serv-reasoning/api
- Chat completions: https://docs.openserv.ai/serv-reasoning/api/chat-completions
- Responses (reasoning summaries): https://docs.openserv.ai/serv-reasoning/api/responses
- Models catalog: https://docs.openserv.ai/serv-reasoning/models
- Docs index: https://docs.openserv.ai/llms.txt
- Console: https://console.openserv.ai
- Base URL: `https://inference-api.openserv.ai`
- Auth: `Authorization: Bearer <key>`
- Live model list: `GET /v1/models`

## Graph Sharding and SERV v3
- Introducing Graph Sharding: https://x.com/openservai/status/2112601266010341727
- Platform vision (12 Nov 2026): https://x.com/openservai/status/2120911633971040519
- Boundaries and control: https://x.com/dashersw/status/2120925254222573604
- Graph Sharding interest form: https://openserv.typeform.com/graphsharding

## Dolphin
- Coupon credits: https://dphn.ai/docs/coupon-credits/
- Network API: https://dphn.ai/docs/dphn-api/
- Base URL: `https://lighthouse.dphn.ai/run/text-v/v1` (OpenAI-compatible)
- Live model list: `GET /models`
- App: https://app.dphn.ai

## Kite
- Passport: https://docs.gokite.ai/passport
- Install: https://docs.gokite.ai/passport/install
- Passport skills: https://docs.gokite.ai/reference/passport-skills
- kpass CLI reference: https://docs.gokite.ai/reference/kpass-cli
- Docs index: https://docs.gokite.ai/llms.txt
- Reference implementation of `kpass` output handling: https://github.com/gnanam1990/kitepass-mcp
- Reference repositories:
  - https://github.com/CarryWang/kite-x402-explorer
  - https://github.com/BrKDDD/kite-x402-hono
  - https://github.com/tianzeshi-study/kite-x402-axum
  - https://github.com/gokite-ai/kite_counter_dapp

## Reppo
- Integration guide for agents: https://eval.reppo.xyz/agents.md
- What is the Evaluation API: https://docs.reppo.ai/concepts/evaluation-api
- API overview: https://docs.reppo.ai/api/eval/overview
- Console and API keys: https://eval.reppo.xyz
- Base URL: `https://eval.reppo.xyz/api/v1`
- Docs index: https://docs.reppo.ai/llms.txt

## OpenServ open source
- Org: https://github.com/openserv-labs
- SDK: https://github.com/openserv-labs/sdk
- Agent examples: https://github.com/openserv-labs/agent-examples
- Docs repository: https://github.com/openserv-labs/openserv-docs

## Integration notes
- SERV needs a system prompt on every request, and Openpath sends one.
- `/v1/chat/completions` works across the whole SERV catalog.
- Reppo evaluations are asynchronous: submit, keep the `id`, and poll until `COMPLETED`.
- Kite Passport runs through the `kpass` CLI, which Openpath calls when `KPASS_BIN` is set.
