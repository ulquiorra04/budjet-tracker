import type { BudgetSummary, Transaction } from "./types";

export function summarize(transactions: Transaction[]): BudgetSummary {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}
