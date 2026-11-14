"use server";

import { revalidatePath } from "next/cache";
import {
  categoryExists,
  createCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/categories";
import { clientExists, createClient, deleteClient, updateClient } from "@/lib/clients";
import { createTransaction, deleteTransaction, updateTransaction } from "@/lib/transactions";
import type { Category, Client, Transaction } from "@/lib/types";
import { validateCategoryName, validateClient, validateTransaction } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/clients");
}

// ---- Transactions ---------------------------------------------------------

function parseTransactionInput(input: unknown) {
  const parsed = validateTransaction(input);
  if (!parsed.ok) return parsed;
  if (!categoryExists(parsed.value.category)) {
    return { ok: false as const, error: "That category no longer exists. Pick another one." };
  }
  if (!clientExists(parsed.value.clientId)) {
    return { ok: false as const, error: "That client no longer exists. Pick another one." };
  }
  return parsed;
}

export async function addTransactionAction(
  input: unknown,
): Promise<ActionResult<Transaction>> {
  const parsed = parseTransactionInput(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const transaction = createTransaction(parsed.value);
  revalidateAll();
  return { ok: true, data: transaction };
}

export async function updateTransactionAction(
  id: unknown,
  input: unknown,
): Promise<ActionResult<Transaction>> {
  if (typeof id !== "string" || !id) return { ok: false, error: "Missing transaction id." };
  const parsed = parseTransactionInput(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const transaction = updateTransaction(id, parsed.value);
  if (!transaction) return { ok: false, error: "Transaction not found." };

  revalidateAll();
  return { ok: true, data: transaction };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Missing transaction id." };
  }
  const removed = deleteTransaction(id);
  if (!removed) return { ok: false, error: "Transaction not found." };

  revalidateAll();
  return { ok: true, data: undefined };
}

// ---- Categories -----------------------------------------------------------

export async function addCategoryAction(name: unknown): Promise<ActionResult<Category>> {
  const parsed = validateCategoryName(name);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const result = createCategory(parsed.value);
  if (!result.ok) return result;

  revalidateAll();
  return { ok: true, data: result.category };
}

export async function renameCategoryAction(
  id: unknown,
  name: unknown,
): Promise<ActionResult<Category>> {
  if (typeof id !== "string" || !id) return { ok: false, error: "Missing category id." };
  const parsed = validateCategoryName(name);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const result = renameCategory(id, parsed.value);
  if (!result.ok) return result;

  revalidateAll();
  return { ok: true, data: result.category };
}

export async function deleteCategoryAction(id: unknown): Promise<ActionResult> {
  if (typeof id !== "string" || !id) return { ok: false, error: "Missing category id." };

  const result = deleteCategory(id);
  if (!result.ok) return result;

  revalidateAll();
  return { ok: true, data: undefined };
}

// ---- Clients --------------------------------------------------------------

export async function addClientAction(input: unknown): Promise<ActionResult<Client>> {
  const parsed = validateClient(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const result = createClient(parsed.value);
  if (!result.ok) return result;

  revalidateAll();
  return { ok: true, data: result.client };
}

export async function updateClientAction(
  id: unknown,
  input: unknown,
): Promise<ActionResult<Client>> {
  if (typeof id !== "string" || !id) return { ok: false, error: "Missing client id." };
  const parsed = validateClient(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const result = updateClient(id, parsed.value);
  if (!result.ok) return result;

  revalidateAll();
  return { ok: true, data: result.client };
}

export async function deleteClientAction(id: unknown): Promise<ActionResult> {
  if (typeof id !== "string" || !id) return { ok: false, error: "Missing client id." };

  const result = deleteClient(id);
  if (!result.ok) return result;

  revalidateAll();
  return { ok: true, data: undefined };
}
