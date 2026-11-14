export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date (YYYY-MM-DD)
  clientId: string;
  /** Display name of the linked client, resolved at read time. */
  clientName: string;
}

export interface BudgetSummary {
  income: number;
  expenses: number;
  balance: number;
}
