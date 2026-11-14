"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MonthlyBudgetProps {
  budget: number;
  spent: number;
  onChange: (value: number) => void;
}

export function MonthlyBudget({ budget, spent, onChange }: MonthlyBudgetProps) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const remaining = budget - spent;
  const over = remaining < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly budget</CardTitle>
        <CardDescription>Track spending against your limit</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget limit</Label>
          <Input
            id="budget"
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={budget}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
          />
        </div>
        <Progress value={pct}>
          <ProgressLabel>Spent</ProgressLabel>
          <ProgressValue>{() => `${formatCurrency(spent)} / ${formatCurrency(budget)}`}</ProgressValue>
        </Progress>
        <p className={cn("text-sm", over ? "text-destructive" : "text-muted-foreground")}>
          {over
            ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
            : `${formatCurrency(remaining)} left to spend`}
        </p>
      </CardContent>
    </Card>
  );
}
