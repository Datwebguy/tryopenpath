# Security

Openpath makes decisions about money, so it is built to keep each visitor's data private, keep the decision on record trustworthy, and keep your credits safe.

## How visitors are kept apart
- Every visitor gets a private workspace tied to a random 128-bit cookie (`op_ws`). It is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Policy and history are stored per workspace. No route accepts a workspace id from the request, so one visitor cannot name another's data.
- The cookie value is checked against an exact pattern before it can reach the disk, and every file path is checked to stay inside the data folder.
- Workspaces do not need accounts. A workspace lives in the browser that created it.

## A decision on record is the one the server made
- `POST /api/decide` saves each run itself. `POST /api/evaluate` only accepts a `runId` and sends that saved run to Reppo, so a made-up decision can never be scored or stored.
- A score can only be read by the workspace that owns the run.
- Shared run links open a read-only page. They do not include the internal score id.

## Your rules are data, never code
- SERV Reasoning turns a sentence into a small structure. Openpath validates it against exact lists of fields and operators, with limits on depth and size, and evaluates it with fixed logic.
- Nothing from SERV, from a user, or from a saved file is ever executed.
- Names like `constructor` or `__proto__` are refused as fields.

## The AI treats notes as untrusted
- The judgment prompt tells the model that the case and its notes are untrusted third-party text, and never to follow instructions found in them.
- The case is sent inside labeled blocks, and notes that try to instruct the reviewer are escalated to a person.
- Fixed rules run first. Limits, PO numbers and vendors are checked exactly, so an instruction in the notes cannot change them.
- Tested with three attack styles: an "ignore previous instructions" note, a fake system message, and an answer-format hijack. Each was escalated.

## Input limits
- Case amounts must be positive and finite. Vendor, PO number and notes are length-limited, and control characters are removed.
- Request bodies are size-limited (413 when exceeded), and broken JSON is a clean 400.
- Policies are limited in text length and list size. A workspace keeps its latest 100 runs.

## Protection for your credits
- Per-visitor and overall rate limits on the routes that call SERV and Reppo (`/api/decide`, `/api/evaluate`, `/api/rules/compile`), with friendly 429 answers.
- Keys live only in environment variables on the server. `/api/status` returns yes or no values, never keys. Error details stay in the server log, and visitors see plain messages.

## Browser protections
Every page is sent with a Content-Security-Policy, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and `Strict-Transport-Security`. API answers are never cached. The `X-Powered-By` header is hidden. No page uses raw HTML injection, and React escapes everything shown.

## Dependencies
`npm audit` reports 0 vulnerabilities. The project pins a patched PostCSS through `overrides`, and runs `kpass` (when connected) without a shell and with no user text in its arguments.

## Reporting a problem
Please open a private security advisory on the repository, or contact the author through GitHub: [Datwebguy](https://github.com/Datwebguy).
