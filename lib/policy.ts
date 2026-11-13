export const POLICY_TEXT =
  "Approve the payment only if the amount is under the user-set limit, " +
  "the invoice number matches a known PO, and the vendor is on the approved list. " +
  "Otherwise deny and give the exact reason.";

// Demo data. A real setup would load these from a database.
export const KNOWN_POS = ["PO-1001", "PO-1002", "PO-1003"];
export const APPROVED_VENDORS = ["Acme Supplies", "Globex Ltd", "Initech"];
