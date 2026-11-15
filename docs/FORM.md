# Submission form answers

Form: https://openserv.typeform.com/submissions02
Deadline: Nov 15, 23:59 UTC

## Project name
Openpath

## Tracks
Reppo and Open

## One line
Stop invoice fraud before your AI agent pays.

## Short write-up
Fraudsters target whoever pays the invoices: a changed bank account, an urgent message from the "CEO", a note telling the reviewer to skip checks. AI agents now pay invoices too, and an AI can be talked into a yes. Openpath sits between the agent and the money and puts every payment decision on a path you can inspect.

Fixed rules the AI cannot override are checked first: spending limits, known POs, approved vendors, each vendor's bank account on file, and rules the owner writes in plain English. If a rule decides, the AI is never asked. SERV Reasoning is used only for judgment calls, such as notes that sound like fraud. Reppo's independent evaluators score every decision, the score feeds the next run of the same case, and any run can be shared as proof.

It is built for small finance teams, bookkeepers, and anyone building an AI agent that pays bills.

## How SERV Reasoning is used
SERV Reasoning does two jobs. First, it writes rules from plain English: the owner types "Send anything over 2000 dollars from a vendor we have not used before to review", SERV returns a structured rule, Openpath shows how it understood it ("When the amount is over $2,000 and the vendor is new, send it to a person"), and the rule is enforced as data, the same way every time. Second, it makes the judgment call after the rules clear a case, through /v1/chat/completions, with a system prompt that marks the case notes as untrusted so notes that try to instruct the AI are refused and escalated. Every step is labeled as a rule or AI and recorded, which is the inspectable, bounded reasoning OpenServ describes with Graph Sharding.

## Partner usage (Reppo)
Every decision is submitted to the Reppo Evaluation API together with the policy and the owner's rules. The score, route, reason and rubric scores are saved, fed into the next run of the same case, and shown as a score change and a chart.

## Links
- Live demo: https://openpath.up.railway.app
- Repository: https://github.com/Datwebguy/tryopenpath
- Demo video: ADD YOUR YOUTUBE LINK
- X post: ADD YOUR X POST LINK
- Real runs to open (full path and score):
  - Bank details changed, payment held: https://openpath.up.railway.app/run/b492a4e982
  - An attack hidden in the notes, caught: https://openpath.up.railway.app/run/ec659067be

## Checklist
- [x] Data collection enabled in the OpenServ organization settings
- [ ] Demo video uploaded to YouTube
- [ ] Post on X tagging @openservai
- [ ] Form submitted
