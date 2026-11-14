# Budjet Tracker

A simple personal budget tracker built with [Next.js](https://nextjs.org) (App Router) and [shadcn/ui](https://ui.shadcn.com).

## Features

- Collapsible sidebar navigation (Transactions, Categories) with a theme toggle
- Categories page to add, rename and delete categories, with per-category counts, income, expenses and net
- Add income and expense transactions with category, description and date
- Summary cards for balance, total income and total expenses
- Filterable transactions table (all / income / expenses) with delete
- Monthly budget limit with a progress bar and remaining amount
- Spending breakdown by category
- Light / dark theme toggle
- Transactions and categories are stored in a local SQLite database (`data/budjet.db`)
- Monthly budget limit is remembered per browser via `localStorage`

## Tech stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI primitives) with `lucide-react` icons, including the sidebar block
- `next-themes` for theming, `sonner` for toasts
- SQLite via `better-sqlite3`, accessed through Next.js Server Actions

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The SQLite database is created automatically at `data/budjet.db` on first use.
To populate it with a few example transactions:

```bash
npm run db:seed
```

Set `DATABASE_PATH` to store the database somewhere else.

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Create a production build        |
| `npm run start` | Serve the production build       |
| `npm run lint`  | Run ESLint                       |
| `npm run db:seed` | Insert example transactions (skips if data exists) |
| `npm run db:reset` | Delete all transactions and categories, restore default categories |

## Project structure

```
src/
  app/            # App Router layout (sidebar shell), home and /categories pages
  components/     # Feature components (tracker, form, table, charts)
    ui/           # shadcn/ui generated components
    db.ts         # SQLite connection and schema
    transactions.ts # Transaction data access (list / create / delete)
    categories.ts # Category data access (list with stats / create / rename / delete)
    validation.ts # Input validation shared by the server action
  app/actions.ts  # Server Actions called from the client components
  lib/            # Types, formatting helpers, summary and budget hook
scripts/seed.mts  # Example data seeder
scripts/reset.mts # Clears all data and restores default categories
data/             # SQLite database file (git-ignored)
```

## Database

Table `transactions`:

| Column        | Type | Notes                                   |
| ------------- | ---- | --------------------------------------- |
| `id`          | TEXT | UUID primary key                        |
| `type`        | TEXT | `income` or `expense`                   |
| `amount`      | REAL | Must be greater than zero               |
| `category`    | TEXT | One of the categories in `lib/types.ts` |
| `description` | TEXT |                                         |
| `date`        | TEXT | ISO date `YYYY-MM-DD`                   |
| `created_at`  | TEXT | ISO timestamp, set by SQLite            |

Table `categories`:

| Column       | Type | Notes                               |
| ------------ | ---- | ----------------------------------- |
| `id`         | TEXT | UUID primary key                    |
| `name`       | TEXT | Unique, case-insensitive, non-empty |
| `created_at` | TEXT | ISO timestamp, set by SQLite        |

Transactions reference a category by name. Renaming a category updates its
transactions in the same SQL transaction, and a category that is still in use
cannot be deleted. When the `categories` table is first created it is seeded
with a default set plus any names already present in `transactions`.

The schema is applied with `CREATE TABLE IF NOT EXISTS` when the connection opens, and WAL journaling is enabled.

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```
