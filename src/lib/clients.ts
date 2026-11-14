import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type { Client } from "./types";
import type { ClientInput } from "./validation";

export interface ClientWithStats extends Client {
  count: number;
  income: number;
  expenses: number;
}

export type ClientMutation = { ok: true; client: Client } | { ok: false; error: string };

const CLIENT_COLUMNS = "id, name, phone, email, notes";

export function listClients(): Client[] {
  return getDb()
    .prepare<[], Client>(`SELECT ${CLIENT_COLUMNS} FROM clients ORDER BY name COLLATE NOCASE`)
    .all();
}

export function listClientsWithStats(): ClientWithStats[] {
  return getDb()
    .prepare<[], ClientWithStats>(
      `SELECT
         c.id, c.name, c.phone, c.email, c.notes,
         COUNT(t.id) AS count,
         COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount END), 0) AS income,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS expenses
       FROM clients c
       LEFT JOIN transactions t ON t.client_id = c.id
       GROUP BY c.id
       ORDER BY c.name COLLATE NOCASE`,
    )
    .all();
}

export function clientExists(id: string): boolean {
  return (
    getDb()
      .prepare<[string], { n: number }>("SELECT COUNT(*) AS n FROM clients WHERE id = ?")
      .get(id)!.n > 0
  );
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && err.message.includes("UNIQUE constraint failed");
}

export function createClient(input: ClientInput): ClientMutation {
  const client: Client = { id: randomUUID(), ...input };
  try {
    getDb()
      .prepare(
        `INSERT INTO clients (id, name, phone, email, notes)
         VALUES (@id, @name, @phone, @email, @notes)`,
      )
      .run(client);
    return { ok: true, client };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: `A client named "${input.name}" already exists.` };
    }
    throw err;
  }
}

export function updateClient(id: string, input: ClientInput): ClientMutation {
  const db = getDb();
  const current = db
    .prepare<[string], Client>(`SELECT ${CLIENT_COLUMNS} FROM clients WHERE id = ?`)
    .get(id);
  if (!current) return { ok: false, error: "Client not found." };

  const client: Client = { id, ...input };
  try {
    db.prepare(
      `UPDATE clients SET name = @name, phone = @phone, email = @email, notes = @notes
       WHERE id = @id`,
    ).run(client);
    return { ok: true, client };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: `A client named "${input.name}" already exists.` };
    }
    throw err;
  }
}

export function deleteClient(id: string): { ok: true } | { ok: false; error: string } {
  const db = getDb();
  const current = db
    .prepare<[string], Client>(`SELECT ${CLIENT_COLUMNS} FROM clients WHERE id = ?`)
    .get(id);
  if (!current) return { ok: false, error: "Client not found." };

  const { n } = db
    .prepare<[string], { n: number }>("SELECT COUNT(*) AS n FROM transactions WHERE client_id = ?")
    .get(id)!;
  if (n > 0) {
    return {
      ok: false,
      error: `"${current.name}" is linked to ${n} ${n === 1 ? "transaction" : "transactions"}. Reassign or delete them first.`,
    };
  }

  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
  return { ok: true };
}
