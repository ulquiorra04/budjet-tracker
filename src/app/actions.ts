"use server";

import { revalidatePath } from "next/cache";
import {
  categoryExists,
  createCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/categories";
import { createTransaction, deleteTransaction } from "@/lib/transactions";
import type { Category, Transaction } from "@/lib/types";
import { validateCategoryName, validateTransaction } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/categories");
}

// ---- Transactions ---------------------------------------------------------

export async function addTransactionAction(
  input: unknown,
): Promise<ActionResult<Transaction>> {
  const parsed = validateTransaction(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  if (!categoryExists(parsed.value.category)) {
    return { ok: false, error: "That category no longer exists. Pick another one." };
  }

  const transaction = createTransaction(parsed.value);
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
