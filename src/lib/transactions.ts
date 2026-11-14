import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type { Transaction } from "./types";
import type { NewTransaction } from "./validation";

export function listTransactions(): Transaction[] {
  return getDb()
    .prepare<[], Transaction>(
      `SELECT
         t.id, t.type, t.amount, t.category, t.description, t.date,
         t.client_id AS clientId,
         c.name      AS clientName
       FROM transactions t
       JOIN clients c ON c.id = t.client_id
       ORDER BY t.date DESC, t.created_at DESC`,
    )
    .all();
}

export function createTransaction(input: NewTransaction): Transaction {
  const db = getDb();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO transactions (id, type, amount, category, description, date, client_id)
     VALUES (@id, @type, @amount, @category, @description, @date, @clientId)`,
  ).run({ id, ...input });

  const { name: clientName } = db
    .prepare<[string], { name: string }>("SELECT name FROM clients WHERE id = ?")
    .get(input.clientId)!;
  return { id, ...input, clientName };
}

export function updateTransaction(id: string, input: NewTransaction): Transaction | null {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE transactions
       SET type = @type, amount = @amount, category = @category,
           description = @description, date = @date, client_id = @clientId
       WHERE id = @id`,
    )
    .run({ id, ...input });
  if (result.changes === 0) return null;

  const { name: clientName } = db
    .prepare<[string], { name: string }>("SELECT name FROM clients WHERE id = ?")
    .get(input.clientId)!;
  return { id, ...input, clientName };
}

export function deleteTransaction(id: string): boolean {
  const result = getDb().prepare(`DELETE FROM transactions WHERE id = ?`).run(id);
  return result.changes > 0;
}
