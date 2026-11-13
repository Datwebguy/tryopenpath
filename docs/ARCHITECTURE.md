# Openpath — Architecture

## Overview
Simple Next.js app with a single core flow: policy + case → SERV Reasoning → visible path → evaluation → stored feedback.

## Components

### Frontend
- Policy display (hardcoded demo policy for the hackathon)
- Case input form (amount, vendor, invoice number, notes)
- Results panel:
  - Decision (approve / deny / escalate)
  - Path list (each step labeled `code` or `model`)
  - Reason
  - Reppo score + evalId
- Re-run button

### Backend (API routes or server actions)
1. **POST /api/decide**
   - Receives policy + case
   - Builds system prompt that forces structured JSON with path
   - Calls SERV Reasoning (`https://inference-api.openserv.ai/v1/chat/completions`)
   - Optionally routes judgment steps through Dolphin
   - Applies Kite-style limit check (real or stub)
   - Returns decision + path

2. **POST /api/evaluate**
   - Takes the decision + path
   - Submits to Reppo Evaluation API
   - Returns evalId and (after polling) score

3. **Storage**
   - Simple in-memory or local JSON / SQLite for demo history
   - Stores previous runs of the same case so feedback can influence the next prompt or be displayed as history

## Data flow
```
User input (policy + case)
        ↓
Build system prompt (force JSON path with code/model labels)
        ↓
SERV Reasoning call
        ↓
Parse decision + path
        ↓
Apply Kite limit check (insert as code step)
        ↓
Show path + decision
        ↓
Submit to Reppo → store score
        ↓
On re-run: include previous score/feedback in context
```

## Path structure (example)
```json
{
  "decision": "deny",
  "reason": "Amount exceeds limit",
  "path": [
    { "step": "parse_case", "type": "code", "result": "ok" },
    { "step": "check_amount_limit", "type": "code", "result": "failed" },
    { "step": "vendor_check", "type": "model", "result": "skipped" }
  ]
}
```

## Partner integration points
- **SERV**: Every decision
- **Dolphin**: Model nodes (optional fallback to SERV catalog)
- **Kite**: Spending limit + identity gate (stub acceptable)
- **Reppo**: Post-decision scoring and feedback loop

## Constraints for the hackathon
- One policy is enough
- Stub Kite if live CLI setup delays the demo
- Prefer readable code over perfect architecture
- Keep the UI simple and the path obvious
