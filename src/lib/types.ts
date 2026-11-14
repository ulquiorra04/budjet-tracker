export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date (YYYY-MM-DD)
}

export interface BudgetSummary {
  income: number;
  expenses: number;
  balance: number;
}
