"use client";

import Link from "next/link";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { MonthlyBudget } from "@/components/monthly-budget";
import { PageHeader } from "@/components/page-header";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable } from "@/components/transactions-table";
import { summarize } from "@/lib/summary";
import type { Category, Client, Transaction } from "@/lib/types";
import { useMonthlyBudget } from "@/lib/use-monthly-budget";

export function BudgetTracker({
  transactions,
  categories,
  clients,
}: {
  transactions: Transaction[];
  categories: Category[];
  clients: Client[];
}) {
  const summary = summarize(transactions);
  const [monthlyBudget, setMonthlyBudget] = useMonthlyBudget();

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Keep an eye on where your money goes."
        actions={<TransactionForm categories={categories} clients={clients} />}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        {clients.length === 0 && (
          <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
            Every transaction belongs to a client.{" "}
            <Link href="/clients" className="font-medium text-foreground underline underline-offset-4">
              Add a client
            </Link>{" "}
            before recording transactions.
          </p>
        )}
        <SummaryCards summary={summary} />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <TransactionsTable transactions={transactions} categories={categories} clients={clients} />
          <div className="grid gap-6 content-start">
            <MonthlyBudget budget={monthlyBudget} spent={summary.expenses} onChange={setMonthlyBudget} />
            <CategoryBreakdown transactions={transactions} />
          </div>
        </div>
      </div>
    </>
  );
}
