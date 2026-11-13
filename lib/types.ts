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
  provider?: string; // which model answered a model step
  ms?: number; // how long the step took
};

export type Decision = {
  decision: "approve" | "deny" | "escalate";
  reason: string;
  path: Step[];
  ms?: number; // total time for the whole path
};

export type EvalStatus = "PENDING" | "SETTLED" | "FAILED";

export type EvalResult = {
  evalId: string;
  status: EvalStatus;
  score?: number; // overall 0-100
  verdict?: string; // accept | reject
  route?: string; // ship | review | block
  critiques?: { criterion: string; score: number }[]; // per-dimension scores, 0-100
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
