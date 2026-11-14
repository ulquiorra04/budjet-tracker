export type TransactionType = "income" | "expense";

export const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Shopping",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date (YYYY-MM-DD)
}

export interface BudgetSummary {
  income: number;
  expenses: number;
  balance: number;
}
