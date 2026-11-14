import { CATEGORIES, type Category, type Transaction, type TransactionType } from "./types";

export type NewTransaction = Omit<Transaction, "id">;

export type ValidationResult =
  | { ok: true; value: NewTransaction }
  | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateTransaction(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid transaction payload." };
  }
  const { type, amount, category, description, date } = input as Record<string, unknown>;

  if (type !== "income" && type !== "expense") {
    return { ok: false, error: "Type must be income or expense." };
  }
  const parsedAmount = typeof amount === "string" ? Number(amount) : amount;
  if (typeof parsedAmount !== "number" || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { ok: false, error: "Enter an amount greater than zero." };
  }
  if (typeof category !== "string" || !(CATEGORIES as readonly string[]).includes(category)) {
    return { ok: false, error: "Pick a valid category." };
  }
  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, error: "Add a short description." };
  }
  if (description.trim().length > 200) {
    return { ok: false, error: "Description must be 200 characters or fewer." };
  }
  if (typeof date !== "string" || !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    return { ok: false, error: "Pick a valid date." };
  }

  return {
    ok: true,
    value: {
      type: type as TransactionType,
      amount: Math.round(parsedAmount * 100) / 100,
      category: category as Category,
      description: description.trim(),
      date,
    },
  };
}
