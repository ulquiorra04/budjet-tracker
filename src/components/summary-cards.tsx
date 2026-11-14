import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { BudgetSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SummaryCards({ summary }: { summary: BudgetSummary }) {
  const items = [
    {
      label: "Balance",
      value: summary.balance,
      icon: Wallet,
      tone: summary.balance >= 0 ? "text-foreground" : "text-destructive",
      hint: "Income minus expenses",
    },
    {
      label: "Income",
      value: summary.income,
      icon: ArrowUpRight,
      tone: "text-emerald-600 dark:text-emerald-400",
      hint: "Total money in",
    },
    {
      label: "Expenses",
      value: summary.expenses,
      icon: ArrowDownRight,
      tone: "text-rose-600 dark:text-rose-400",
      hint: "Total money out",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(({ label, value, icon: Icon, tone, hint }) => (
        <Card key={label}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Icon className="size-4" />
              {label}
            </CardDescription>
            <CardTitle className={cn("text-2xl font-semibold tabular-nums", tone)}>
              {formatCurrency(value)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
        </Card>
      ))}
    </div>
  );
}
