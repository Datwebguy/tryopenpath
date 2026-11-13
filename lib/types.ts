export type Case = {
  amount: number;
  vendor: string;
  invoiceNumber: string;
  notes: string;
};

export type Step = {
  step: string;
  type: "code" | "model";
  result: string;
  detail?: string;
  provider?: string;
};

export type Decision = {
  decision: "approve" | "deny" | "escalate";
  reason: string;
  path: Step[];
};

export type EvalStatus = "PENDING" | "SETTLED" | "FAILED";

export type EvalResult = {
  evalId: string;
  status: EvalStatus;
  score?: number; // overall 0-100
  verdict?: string; // accept | revise | reject
  critiques?: { criterion: string; score: number; critique: string }[];
  reason?: string;
};

export type Run = {
  caseKey: string;
  case: Case;
  decision: Decision;
  evalId?: string;
  eval?: EvalResult;
  at: string;
};
