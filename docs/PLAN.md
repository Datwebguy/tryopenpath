# Openpath: Build Plan

## Delivered
- [x] Next.js and TypeScript app
- [x] Policy editor with plain text, spending limit, vendor and PO tags
- [x] Case form with suggestions from the saved lists
- [x] Hard rules as code: fields, spending limit, PO match, vendor list
- [x] Judgment step on SERV Reasoning
- [x] Path graph with code and model steps, timings and skipped steps
- [x] Reppo scoring with a live status and a per-dimension breakdown
- [x] Stored history and feedback that carries into the next run
- [x] Score change shown between runs
- [x] Kite Passport identity, per-transaction limit, remaining budget and expiry checks through `kpass`
- [x] Light, responsive interface with motion
- [x] README, `.env.example`, license and documentation

## Next
1. Deploy on Railway with a volume for `/data`.
2. Record a short walkthrough: policy, case, path, score, re-run.
3. Write the X post tagging @openservai.
4. Complete the submission form: https://openserv.typeform.com/submissions02

## Done when
Anyone can open the demo, write a policy, submit a case, read a clear path, understand the decision, and see a score and its effect on the next run.
