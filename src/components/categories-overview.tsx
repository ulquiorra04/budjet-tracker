import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import type { CategoryStat } from "@/lib/transactions";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoriesOverview({ stats }: { stats: CategoryStat[] }) {
  const totalExpenses = stats.reduce((sum, s) => sum + s.expenses, 0);
  const used = new Set(stats.map((s) => s.category));
  const unused = CATEGORIES.filter((c) => !used.has(c));

  return (
    <>
      {stats.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No transactions yet. Add some to see category totals.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => {
            const net = s.income - s.expenses;
            const share = totalExpenses > 0 ? Math.round((s.expenses / totalExpenses) * 100) : 0;
            return (
              <Card key={s.category}>
                <CardHeader>
                  <CardTitle>{s.category}</CardTitle>
                  <CardDescription>
                    {s.count} {s.count === 1 ? "transaction" : "transactions"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Income</span>
                    <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(s.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="tabular-nums text-rose-600 dark:text-rose-400">
                      -{formatCurrency(s.expenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 font-medium">
                    <span>Net</span>
                    <span className={cn("tabular-nums", net < 0 && "text-destructive")}>
                      {formatCurrency(net)}
                    </span>
                  </div>
                  {s.expenses > 0 && (
                    <Progress value={share}>
                      <ProgressLabel className="text-xs text-muted-foreground">
                        Share of expenses
                      </ProgressLabel>
                      <ProgressValue className="text-xs">{() => `${share}%`}</ProgressValue>
                    </Progress>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {unused.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unused categories</CardTitle>
            <CardDescription>Available when adding a transaction.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {unused.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
