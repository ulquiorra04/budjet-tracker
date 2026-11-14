"use client";

import { PiggyBank } from "lucide-react";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { MonthlyBudget } from "@/components/monthly-budget";
import { SummaryCards } from "@/components/summary-cards";
import { ThemeToggle } from "@/components/theme-toggle";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable } from "@/components/transactions-table";
import { summarize } from "@/lib/summary";
import type { Transaction } from "@/lib/types";
import { useMonthlyBudget } from "@/lib/use-monthly-budget";

export function BudgetTracker({ transactions }: { transactions: Transaction[] }) {
  const summary = summarize(transactions);
  const [monthlyBudget, setMonthlyBudget] = useMonthlyBudget();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PiggyBank className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Budjet Tracker</h1>
            <p className="text-sm text-muted-foreground">Keep an eye on where your money goes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <TransactionForm />
        </div>
      </header>

      <SummaryCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TransactionsTable transactions={transactions} />
        <div className="grid gap-6 content-start">
          <MonthlyBudget budget={monthlyBudget} spent={summary.expenses} onChange={setMonthlyBudget} />
          <CategoryBreakdown transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
