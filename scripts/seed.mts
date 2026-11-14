// Seed the SQLite database with an example client and a few transactions.
// Usage: npm run db:seed   (safe to re-run: skips if rows already exist)
import { randomUUID } from "node:crypto";
import { DB_PATH, openDatabase } from "../src/lib/db.ts";

const SEED = [
  { type: "income", amount: 3200, category: "Salary", description: "Monthly salary", date: "2026-11-01" },
  { type: "expense", amount: 950, category: "Housing", description: "Rent", date: "2026-11-02" },
  { type: "expense", amount: 120.5, category: "Utilities", description: "Electricity and water", date: "2026-11-05" },
  { type: "expense", amount: 64.2, category: "Food", description: "Groceries", date: "2026-11-08" },
  { type: "income", amount: 450, category: "Freelance", description: "Landing page project", date: "2026-11-10" },
  { type: "expense", amount: 35, category: "Transport", description: "Fuel", date: "2026-11-12" },
] as const;

const db = openDatabase();
const { count } = db.prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM transactions").get()!;

if (count > 0) {
  console.log(`Database already has ${count} transaction(s) at ${DB_PATH}; nothing seeded.`);
} else {
  const insert = db.prepare(
    `INSERT INTO transactions (id, type, amount, category, description, date, client_id)
     VALUES (@id, @type, @amount, @category, @description, @date, @clientId)`,
  );
  db.transaction(() => {
    const clientId = randomUUID();
    db.prepare("INSERT INTO clients (id, name, email) VALUES (?, ?, ?)").run(
      clientId,
      "Example Client",
      "hello@example.com",
    );
    for (const row of SEED) insert.run({ id: randomUUID(), clientId, ...row });
  })();
  console.log(`Seeded 1 client and ${SEED.length} transactions into ${DB_PATH}.`);
}
db.close();
