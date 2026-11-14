"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTransactionAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionDialog } from "@/components/transaction-form";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, Client, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "income" | "expense";

export function TransactionsTable({
  transactions,
  categories,
  clients,
}: {
  transactions: Transaction[];
  categories: Category[];
  clients: Client[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteTransactionAction(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast("Transaction deleted.");
    });
  }

  const visible = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {visible.length} {visible.length === 1 ? "entry" : "entries"}
          </CardDescription>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No transactions yet. Add one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">{t.clientName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.category}</Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      t.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${t.description}`}
                        disabled={deletingId === t.id}
                        onClick={() => setEditing(t)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${t.description}`}
                        disabled={deletingId === t.id}
                        onClick={() => handleDelete(t.id)}
                      >
                        {deletingId === t.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <TransactionDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        transaction={editing}
        categories={categories}
        clients={clients}
      />
    </Card>
  );
}
