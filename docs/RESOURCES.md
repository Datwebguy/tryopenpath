# Openpath — Resources

All primary sources for the SERV Hackathon Edition 02 and the partner stacks.

## Hackathon
- Official page: https://www.openserv.ai/hackathon-2
- Submission form: https://openserv.typeform.com/submissions02
- OpenServ X: https://x.com/openservai
- Previous edition winners page: https://www.openserv.ai/hackathon

## SERV Reasoning
- What is SERV: https://docs.openserv.ai/what-is-serv
- Quickstart: https://docs.openserv.ai/serv-reasoning/introduction
- API overview: https://docs.openserv.ai/serv-reasoning/api
- Chat completions: https://docs.openserv.ai/serv-reasoning/api/chat-completions
- Responses (reasoning summaries): https://docs.openserv.ai/serv-reasoning/api/responses
- Models catalog: https://docs.openserv.ai/serv-reasoning/models
- Why SERV Reasoning: https://docs.openserv.ai/serv-reasoning/why
- Docs index (llms.txt): https://docs.openserv.ai/llms.txt
- Console / playground: https://console.openserv.ai
- Base URL: `https://inference-api.openserv.ai`
- Auth: Bearer token from console.openserv.ai

## Graph Sharding / SERV v3 signals
- Introducing Graph Sharding (X thread): https://x.com/openservai/status/2112601266010341727
- Platform vision post (12 Nov 2026): https://x.com/openservai/status/2120911633971040519
- Armagan on boundaries and control: https://x.com/dashersw/status/2120925254222573604
- Graph Sharding beta interest form: https://openserv.typeform.com/graphsharding

## Dolphin (open models / distributed inference)
- Coupon credits: https://dphn.ai/docs/coupon-credits/
- Network API: https://dphn.ai/docs/dphn-api/
- Base URL: `https://lighthouse.dphn.ai/run/text-v/v1` (OpenAI-compatible)
- App: https://app.dphn.ai
- Main site: https://dphn.ai

## Kite (identity + spending limits)
- Kite Passport: https://docs.gokite.ai/passport
- Passport skills: https://docs.gokite.ai/reference/passport-skills
- kpass CLI reference: https://docs.gokite.ai/reference/kpass-cli
- Docs index: https://docs.gokite.ai/llms.txt
- Priority repos mentioned on hackathon page:
  - https://github.com/CarryWang/kite-x402-explorer
  - https://github.com/BrKDDD/kite-x402-hono
  - https://github.com/tianzeshi-study/kite-x402-axum
  - https://github.com/gokite-ai/kite_counter_dapp

## Reppo (evaluation / feedback)
- What is the Evaluation API: https://docs.reppo.ai/concepts/evaluation-api
- Evaluation API overview: https://docs.reppo.ai/api/eval/overview
- Submit and read evaluations: https://docs.reppo.ai/api/eval/evaluations
- Base URL: `https://eval.reppo.xyz/api/v1`
- Console: https://eval.reppo.xyz
- Docs index: https://docs.reppo.ai/llms.txt

## OpenServ open source
- Org: https://github.com/openserv-labs
- SDK: https://github.com/openserv-labs/sdk
- Agent examples: https://github.com/openserv-labs/agent-examples
- Docs repo: https://github.com/openserv-labs/openserv-docs

## Notes for implementation
- SERV requires a system prompt on every request.
- Prefer `/v1/chat/completions` for broad model support.
- Use `/v1/responses` when you want reasoning summaries (OpenAI models only).
- Kite is currently CLI + skills oriented; public HTTP API is not yet fully published. Stub the limit check if live setup is slow.
- Reppo evaluations are async; submit, store evalId, poll until settled.
- Keep the first demo to one policy and one case type.
