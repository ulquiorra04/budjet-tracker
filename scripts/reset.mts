// Delete all transactions and categories, then restore the default categories.
// Usage: npm run db:reset
import { randomUUID } from "node:crypto";
import { DB_PATH, DEFAULT_CATEGORIES, openDatabase } from "../src/lib/db.ts";

const db = openDatabase();
const count = (table: string) =>
  db.prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM ${table}`).get()!.n;

const before = { transactions: count("transactions"), categories: count("categories") };

db.transaction(() => {
  db.prepare("DELETE FROM transactions").run();
  db.prepare("DELETE FROM categories").run();
  const insert = db.prepare("INSERT INTO categories (id, name) VALUES (?, ?)");
  for (const name of DEFAULT_CATEGORIES) insert.run(randomUUID(), name);
})();

console.log(
  `Cleared ${before.transactions} transaction(s) and ${before.categories} categor(ies) from ${DB_PATH}; ` +
    `restored ${DEFAULT_CATEGORIES.length} default categories.`,
);
db.close();
