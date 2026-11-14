import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import type { Category } from "./types";

export interface CategoryWithStats extends Category {
  count: number;
  income: number;
  expenses: number;
}

export type CategoryMutation =
  | { ok: true; category: Category }
  | { ok: false; error: string };

export function listCategories(): Category[] {
  return getDb()
    .prepare<[], Category>("SELECT id, name FROM categories ORDER BY name COLLATE NOCASE")
    .all();
}

export function listCategoriesWithStats(): CategoryWithStats[] {
  return getDb()
    .prepare<[], CategoryWithStats>(
      `SELECT
         c.id,
         c.name,
         COUNT(t.id) AS count,
         COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount END), 0) AS income,
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS expenses
       FROM categories c
       LEFT JOIN transactions t ON t.category = c.name
       GROUP BY c.id
       ORDER BY c.name COLLATE NOCASE`,
    )
    .all();
}

export function categoryExists(name: string): boolean {
  return (
    getDb()
      .prepare<[string], { n: number }>("SELECT COUNT(*) AS n FROM categories WHERE name = ?")
      .get(name)!.n > 0
  );
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && err.message.includes("UNIQUE constraint failed");
}

export function createCategory(name: string): CategoryMutation {
  const category: Category = { id: randomUUID(), name };
  try {
    getDb().prepare("INSERT INTO categories (id, name) VALUES (@id, @name)").run(category);
    return { ok: true, category };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: `A category named "${name}" already exists.` };
    }
    throw err;
  }
}

export function renameCategory(id: string, name: string): CategoryMutation {
  const db = getDb();
  const current = db
    .prepare<[string], Category>("SELECT id, name FROM categories WHERE id = ?")
    .get(id);
  if (!current) return { ok: false, error: "Category not found." };
  if (current.name === name) return { ok: true, category: current };

  try {
    db.transaction(() => {
      db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
      db.prepare("UPDATE transactions SET category = ? WHERE category = ?").run(name, current.name);
    })();
    return { ok: true, category: { id, name } };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: `A category named "${name}" already exists.` };
    }
    throw err;
  }
}

export function deleteCategory(id: string): { ok: true } | { ok: false; error: string } {
  const db = getDb();
  const current = db
    .prepare<[string], Category>("SELECT id, name FROM categories WHERE id = ?")
    .get(id);
  if (!current) return { ok: false, error: "Category not found." };

  const { n } = db
    .prepare<[string], { n: number }>("SELECT COUNT(*) AS n FROM transactions WHERE category = ?")
    .get(current.name)!;
  if (n > 0) {
    return {
      ok: false,
      error: `"${current.name}" is used by ${n} ${n === 1 ? "transaction" : "transactions"}. Reassign or delete them first.`,
    };
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return { ok: true };
}
