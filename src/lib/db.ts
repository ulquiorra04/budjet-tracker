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

/** Name of the client that legacy transactions (created before clients existed) are attached to. */
export const UNASSIGNED_CLIENT_NAME = "Unassigned";

interface ColumnInfo {
  name: string;
  notnull: number;
}

function columnInfo(db: Database.Database, table: string, column: string): ColumnInfo | undefined {
  return db
    .prepare<[], ColumnInfo>(`PRAGMA table_info(${table})`)
    .all()
    .find((c) => c.name === column);
}

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
    CREATE TABLE IF NOT EXISTS clients (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK (length(trim(name)) > 0),
      phone      TEXT NOT NULL DEFAULT '',
      email      TEXT NOT NULL DEFAULT '',
      notes      TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount      REAL NOT NULL CHECK (amount > 0),
      category    TEXT NOT NULL,
      description TEXT NOT NULL,
      date        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
  `);

  // Must run before the client index: older databases lack the column entirely.
  requireTransactionClient(db);
  db.exec("CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions (client_id)");

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

/**
 * Databases created before every transaction required a client: add the
 * column if missing, attach orphaned rows to an "Unassigned" client, then
 * rebuild the table so client_id is NOT NULL (SQLite cannot ALTER a column).
 */
function requireTransactionClient(db: Database.Database) {
  const column = columnInfo(db, "transactions", "client_id");
  if (column?.notnull) return;

  db.transaction(() => {
    if (!column) {
      db.exec("ALTER TABLE transactions ADD COLUMN client_id TEXT REFERENCES clients(id)");
    }

    const orphans = db
      .prepare<[], { n: number }>(
        `SELECT COUNT(*) AS n FROM transactions
         WHERE client_id IS NULL OR client_id NOT IN (SELECT id FROM clients)`,
      )
      .get()!.n;
    if (orphans > 0) {
      db.prepare("INSERT OR IGNORE INTO clients (id, name) VALUES (?, ?)").run(
        randomUUID(),
        UNASSIGNED_CLIENT_NAME,
      );
      const { id } = db
        .prepare<[string], { id: string }>("SELECT id FROM clients WHERE name = ?")
        .get(UNASSIGNED_CLIENT_NAME)!;
      db.prepare(
        `UPDATE transactions SET client_id = ?
         WHERE client_id IS NULL OR client_id NOT IN (SELECT id FROM clients)`,
      ).run(id);
    }

    db.exec(`
      CREATE TABLE transactions_new (
        id          TEXT PRIMARY KEY,
        type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount      REAL NOT NULL CHECK (amount > 0),
        category    TEXT NOT NULL,
        description TEXT NOT NULL,
        date        TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT
      );
      INSERT INTO transactions_new (id, type, amount, category, description, date, created_at, client_id)
        SELECT id, type, amount, category, description, date, created_at, client_id FROM transactions;
      DROP TABLE transactions;
      ALTER TABLE transactions_new RENAME TO transactions;
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
      CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions (client_id);
    `);
  })();
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
