# Budjet Tracker

A simple personal budget tracker built with [Next.js](https://nextjs.org) (App Router) and [shadcn/ui](https://ui.shadcn.com).

## Features

- Collapsible sidebar navigation (Transactions, Categories) with a theme toggle
- Categories page with per-category counts, income, expenses, net and share of spending
- Add income and expense transactions with category, description and date
- Summary cards for balance, total income and total expenses
- Filterable transactions table (all / income / expenses) with delete
- Monthly budget limit with a progress bar and remaining amount
- Spending breakdown by category
- Light / dark theme toggle
- Transactions are stored in a local SQLite database (`data/budjet.db`)
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

## Project structure

```
src/
  app/            # App Router layout (sidebar shell), home and /categories pages
  components/     # Feature components (tracker, form, table, charts)
    ui/           # shadcn/ui generated components
    db.ts         # SQLite connection and schema
    transactions.ts # Data access (list / create / delete)
    validation.ts # Input validation shared by the server action
  app/actions.ts  # Server Actions called from the client components
  lib/            # Types, formatting helpers, summary and budget hook
scripts/seed.mts  # Example data seeder
data/             # SQLite database file (git-ignored)
```

## Database

Single table `transactions`:

| Column        | Type | Notes                                   |
| ------------- | ---- | --------------------------------------- |
| `id`          | TEXT | UUID primary key                        |
| `type`        | TEXT | `income` or `expense`                   |
| `amount`      | REAL | Must be greater than zero               |
| `category`    | TEXT | One of the categories in `lib/types.ts` |
| `description` | TEXT |                                         |
| `date`        | TEXT | ISO date `YYYY-MM-DD`                   |
| `created_at`  | TEXT | ISO timestamp, set by SQLite            |

The schema is applied with `CREATE TABLE IF NOT EXISTS` when the connection opens, and WAL journaling is enabled.

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```
