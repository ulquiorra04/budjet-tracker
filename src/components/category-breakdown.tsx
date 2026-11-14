"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function CategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
        <CardDescription>Share of total expenses</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {byCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses recorded.</p>
        ) : (
          byCategory.map(([category, amount]) => {
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
            return (
              <Progress key={category} value={pct}>
                <ProgressLabel>{category}</ProgressLabel>
                <ProgressValue>
                  {() => `${formatCurrency(amount)} · ${pct}%`}
                </ProgressValue>
              </Progress>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
