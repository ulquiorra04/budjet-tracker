"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addTransactionAction, updateTransactionAction } from "@/app/actions";
import { todayISO } from "@/lib/format";
import type { Category, Client, Transaction, TransactionType } from "@/lib/types";

interface Options {
  categories: Category[];
  clients: Client[];
}

/** Header button that opens the dialog in create mode. */
export function TransactionForm({ categories, clients }: Options) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        disabled={categories.length === 0 || clients.length === 0}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Add transaction
      </Button>
      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        clients={clients}
      />
    </>
  );
}

/** Dialog for creating a transaction, or editing `transaction` when given. */
export function TransactionDialog({
  open,
  onOpenChange,
  transaction = null,
  categories,
  clients,
}: Options & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          // Keyed so the form state restarts for each transaction (or each new entry).
          <TransactionEditor
            key={transaction?.id ?? "new"}
            transaction={transaction}
            categories={categories}
            clients={clients}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TransactionEditor({
  transaction,
  categories,
  clients,
  onDone,
}: Options & { transaction: Transaction | null; onDone: () => void }) {
  const categoryItems = categories.map((c) => ({ value: c.name, label: c.name }));
  const clientItems = clients.map((c) => ({ value: c.id, label: c.name }));
  const editing = transaction !== null;

  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category ?? categories[0]?.name ?? "");
  const [clientId, setClientId] = useState(transaction?.clientId ?? clients[0]?.id ?? "");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [date, setDate] = useState(transaction?.date ?? todayISO());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = { type, amount, category, description, date, clientId };
    startTransition(async () => {
      const result = editing
        ? await updateTransactionAction(transaction.id, payload)
        : await addTransactionAction(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const label = type === "income" ? "Income" : "Expense";
      toast.success(editing ? `${label} updated.` : `${label} added.`);
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit transaction" : "New transaction"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Update the details of this entry."
            : "Record money coming in or going out."}
        </DialogDescription>
      </DialogHeader>

      <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1">
            Expense
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          items={categoryItems}
          value={category}
          onValueChange={(v) => v && setCategory(String(v))}
        >
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Pick a category" />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="client">Client</Label>
        <Select
          items={clientItems}
          value={clientId}
          onValueChange={(v) => v && setClientId(String(v))}
        >
          <SelectTrigger id="client" className="w-full">
            <SelectValue placeholder="Pick a client" />
          </SelectTrigger>
          <SelectContent>
            {clientItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Groceries"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
