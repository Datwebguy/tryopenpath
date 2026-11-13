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
};

export type Decision = {
  decision: "approve" | "deny" | "escalate";
  reason: string;
  path: Step[];
};
