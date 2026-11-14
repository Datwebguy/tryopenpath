# Openpath: Product

## What it is
Openpath stops invoice fraud before an AI agent pays. It sits between the agent and the money and gives a clear, permanent path through every payment decision.

## The problem
Fraudsters target whoever pays the invoices: a changed bank account, an urgent message from the "CEO", a note telling the reviewer to skip checks. AI agents now pay invoices too, and an AI can be talked into a yes. Openpath holds the classic tricks with exact checks, uses AI only for judgment, and scores every decision independently.

You write the rules once and run a case. You see which steps were fixed rules, which step used AI judgment and why, what limits were checked, and what the final decision was. Afterward the decision is scored, and the score and critique are kept so the next run of the same case can be sharper.

## Who it is for
- **Small finance teams and bookkeepers** who let an AI agent approve or pay bills and need a second pair of eyes that cannot be talked around.
- **Builders of AI agents that pay** who need a guardrail and proof in front of the money.
- **Individuals** who want an agent to approve or spend within hard limits and leave a visible trail.
- **Solo builders and freelancers** who need to show a client exactly why something was approved or denied.
- **Small teams and companies** handling invoices, expenses or access who want to prove the reasoning and change one rule without rebuilding the agent.
- **Anyone testing an agent** before it touches real money or real decisions.

## The journey
1. **Policy.** Write the rules in plain language and set the exact values.
2. **Case.** Submit an invoice.
3. **Path.** Watch each step and read the decision.
4. **Score.** Reppo's evaluators score the decision and explain it.
5. **Re-run.** Run the same case again with the stored feedback and see the change.

## What makes a decision inspectable
- An explicit sequence of steps for every run.
- Fixed-rule steps for limits, math and field checks, checked exactly every time.
- An AI step only where judgment is needed, labeled with the model and the time it took.
- Every run saved with its path and score.
- Changed bank details caught against the account on file.
- Reppo scoring that feeds the next run.

## Rules in your own words
Beyond the spending limit, vendor list and PO list, you can write rules as sentences, such as "send anything over 1000 dollars from a vendor we have not used before to review". SERV Reasoning turns each one into an exact rule, shows how it understood it, and the rule then runs the same way on every case.

## Share and compare
Every run has a link that opens a read-only page with the decision, the path and the score. A chart shows how the score moved across runs of the same case.

## Your data, your rules
Nothing is built in. The policy text, spending limit, vendor list and PO list are all yours. The case form suggests values from the lists you saved.

## Tracks
- **Reppo:** real feedback turned into a measurable score change.
- **Open:** SERV Reasoning writes your rules from plain sentences and powers the judgment step.

## Success looks like
Anyone can open the console, write a policy, submit a case, read the full path, understand the decision, and see a second run that reflects the feedback.
