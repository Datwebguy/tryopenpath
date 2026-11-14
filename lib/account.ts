// Bank account helpers. Accounts are compared without spaces or dashes, and shown masked.
export const normAccount = (a: string) => a.replace(/[\s-]/g, "").toUpperCase();
export const maskAccount = (a: string) => {
  const n = normAccount(a);
  return n ? `•••• ${n.slice(-4)}` : "";
};
