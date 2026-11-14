import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type { Transaction } from "./types";
import type { NewTransaction } from "./validation";

type Row = Transaction;

export function listTransactions(): Transaction[] {
  return getDb()
    .prepare<[], Row>(
      `SELECT id, type, amount, category, description, date
       FROM transactions
       ORDER BY date DESC, created_at DESC`,
    )
    .all();
}

export function createTransaction(input: NewTransaction): Transaction {
  const transaction: Transaction = { id: randomUUID(), ...input };
  getDb()
    .prepare(
      `INSERT INTO transactions (id, type, amount, category, description, date)
       VALUES (@id, @type, @amount, @category, @description, @date)`,
    )
    .run(transaction);
  return transaction;
}

export function deleteTransaction(id: string): boolean {
  const result = getDb().prepare(`DELETE FROM transactions WHERE id = ?`).run(id);
  return result.changes > 0;
}
