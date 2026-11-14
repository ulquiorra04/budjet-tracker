import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";

/** Categories inserted when the categories table is first created. */
export const DEFAULT_CATEGORIES = [
  "IPTV",
  "SERVER",
  "Freelance",
  "Receiver",
  "Food",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Shopping",
  "Other",
] as const;

export const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "budjet.db");

function tableExists(db: Database.Database, name: string): boolean {
  return (
    db
      .prepare<[string], { n: number }>(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?",
      )
      .get(name)!.n > 0
  );
}

export function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount      REAL NOT NULL CHECK (amount > 0),
      category    TEXT NOT NULL,
      description TEXT NOT NULL,
      date        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
  `);

  const hadCategories = tableExists(db, "categories");
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK (length(trim(name)) > 0),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  // First time the categories table appears: seed the defaults plus any
  // category names already used by existing transactions.
  if (!hadCategories) {
    const insert = db.prepare(
      "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
    );
    const existing = db
      .prepare<[], { category: string }>("SELECT DISTINCT category FROM transactions")
      .all()
      .map((r) => r.category);
    db.transaction(() => {
      for (const name of [...DEFAULT_CATEGORIES, ...existing]) {
        insert.run(randomUUID(), name);
      }
    })();
  }
}

export function openDatabase(file: string = DB_PATH): Database.Database {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

// Cache the connection on globalThis so Next.js dev-mode module reloads
// don't open a new handle on every change.
const globalForDb = globalThis as unknown as { __budjetDb?: Database.Database };

export function getDb(): Database.Database {
  globalForDb.__budjetDb ??= openDatabase();
  return globalForDb.__budjetDb;
}
