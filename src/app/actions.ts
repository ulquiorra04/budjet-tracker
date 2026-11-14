"use server";

import { revalidatePath } from "next/cache";
import { createTransaction, deleteTransaction } from "@/lib/transactions";
import type { Transaction } from "@/lib/types";
import { validateTransaction } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function addTransactionAction(
  input: unknown,
): Promise<ActionResult<Transaction>> {
  const parsed = validateTransaction(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const transaction = createTransaction(parsed.value);
  revalidatePath("/");
  return { ok: true, data: transaction };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Missing transaction id." };
  }
  const removed = deleteTransaction(id);
  if (!removed) return { ok: false, error: "Transaction not found." };

  revalidatePath("/");
  return { ok: true, data: undefined };
}
