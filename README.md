# Budjet Tracker

A simple personal budget tracker built with [Next.js](https://nextjs.org) (App Router) and [shadcn/ui](https://ui.shadcn.com).

## Features

- Add income and expense transactions with category, description and date
- Summary cards for balance, total income and total expenses
- Filterable transactions table (all / income / expenses) with delete
- Monthly budget limit with a progress bar and remaining amount
- Spending breakdown by category
- Light / dark theme toggle
- Data persists in the browser via `localStorage` (no backend needed)

## Tech stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI primitives) with `lucide-react` icons
- `next-themes` for theming, `sonner` for toasts

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Create a production build        |
| `npm run start` | Serve the production build       |
| `npm run lint`  | Run ESLint                       |

## Project structure

```
src/
  app/            # App Router layout and page
  components/     # Feature components (tracker, form, table, charts)
    ui/           # shadcn/ui generated components
  lib/            # Types, formatting helpers and the localStorage store
```

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```
