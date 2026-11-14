import type { Client, Transaction, TransactionType } from "./types";

export type NewTransaction = Omit<Transaction, "id" | "clientName">;
export type ClientInput = Omit<Client, "id">;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const CATEGORY_NAME_MAX = 40;

export function validateCategoryName(input: unknown): ValidationResult<string> {
  if (typeof input !== "string") return { ok: false, error: "Enter a category name." };
  const name = input.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Enter a category name." };
  if (name.length > CATEGORY_NAME_MAX) {
    return { ok: false, error: `Category names must be ${CATEGORY_NAME_MAX} characters or fewer.` };
  }
  return { ok: true, value: name };
}

export const CLIENT_NAME_MAX = 60;
export const CLIENT_PHONE_MAX = 30;
export const CLIENT_EMAIL_MAX = 120;
export const CLIENT_NOTES_MAX = 500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalText(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

export function validateClient(input: unknown): ValidationResult<ClientInput> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid client payload." };
  }
  const raw = input as Record<string, unknown>;

  if (typeof raw.name !== "string") return { ok: false, error: "Enter a client name." };
  const name = raw.name.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Enter a client name." };
  if (name.length > CLIENT_NAME_MAX) {
    return { ok: false, error: `Client names must be ${CLIENT_NAME_MAX} characters or fewer.` };
  }

  const phone = optionalText(raw.phone);
  if (phone.length > CLIENT_PHONE_MAX) {
    return { ok: false, error: `Phone numbers must be ${CLIENT_PHONE_MAX} characters or fewer.` };
  }

  const email = optionalText(raw.email);
  if (email.length > CLIENT_EMAIL_MAX) {
    return { ok: false, error: `Emails must be ${CLIENT_EMAIL_MAX} characters or fewer.` };
  }
  if (email && !EMAIL.test(email)) return { ok: false, error: "Enter a valid email address." };

  const notes = optionalText(raw.notes);
  if (notes.length > CLIENT_NOTES_MAX) {
    return { ok: false, error: `Notes must be ${CLIENT_NOTES_MAX} characters or fewer.` };
  }

  return { ok: true, value: { name, phone, email, notes } };
}

export function validateTransaction(input: unknown): ValidationResult<NewTransaction> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid transaction payload." };
  }
  const { type, amount, category, description, date, clientId } = input as Record<string, unknown>;

  if (type !== "income" && type !== "expense") {
    return { ok: false, error: "Type must be income or expense." };
  }
  const parsedAmount = typeof amount === "string" ? Number(amount) : amount;
  if (typeof parsedAmount !== "number" || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { ok: false, error: "Enter an amount greater than zero." };
  }
  const categoryResult = validateCategoryName(category);
  if (!categoryResult.ok) return { ok: false, error: "Pick a category." };
  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, error: "Add a short description." };
  }
  if (description.trim().length > 200) {
    return { ok: false, error: "Description must be 200 characters or fewer." };
  }
  if (typeof date !== "string" || !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    return { ok: false, error: "Pick a valid date." };
  }
  if (typeof clientId !== "string" || !clientId) {
    return { ok: false, error: "Pick a client." };
  }

  return {
    ok: true,
    value: {
      type: type as TransactionType,
      amount: Math.round(parsedAmount * 100) / 100,
      category: categoryResult.value,
      description: description.trim(),
      date,
      clientId,
    },
  };
}
