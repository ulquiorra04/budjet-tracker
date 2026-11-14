import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "budjet.db");

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
  `);
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
