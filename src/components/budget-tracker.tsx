"use client";

import { CategoryBreakdown } from "@/components/category-breakdown";
import { MonthlyBudget } from "@/components/monthly-budget";
import { PageHeader } from "@/components/page-header";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable } from "@/components/transactions-table";
import { summarize } from "@/lib/summary";
import type { Transaction } from "@/lib/types";
import { useMonthlyBudget } from "@/lib/use-monthly-budget";

export function BudgetTracker({ transactions }: { transactions: Transaction[] }) {
  const summary = summarize(transactions);
  const [monthlyBudget, setMonthlyBudget] = useMonthlyBudget();

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Keep an eye on where your money goes."
        actions={<TransactionForm />}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <SummaryCards summary={summary} />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <TransactionsTable transactions={transactions} />
          <div className="grid gap-6 content-start">
            <MonthlyBudget budget={monthlyBudget} spent={summary.expenses} onChange={setMonthlyBudget} />
            <CategoryBreakdown transactions={transactions} />
          </div>
        </div>
      </div>
    </>
  );
}
