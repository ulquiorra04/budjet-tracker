"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addClientAction, deleteClientAction, updateClientAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { ClientWithStats } from "@/lib/clients";
import { formatCurrency } from "@/lib/format";
import type { Client } from "@/lib/types";
import {
  CLIENT_EMAIL_MAX,
  CLIENT_NAME_MAX,
  CLIENT_NOTES_MAX,
  CLIENT_PHONE_MAX,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

type Mode = { kind: "create" } | { kind: "edit"; client: ClientWithStats };

export function ClientsManager({ clients }: { clients: ClientWithStats[] }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [deleting, setDeleting] = useState<ClientWithStats | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </CardDescription>
        </div>
        <Button onClick={() => setMode({ kind: "create" })}>
          <Plus className="size-4" />
          Add client
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No clients yet. Every transaction belongs to a client, so add one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => {
                const net = c.income - c.expenses;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span className="font-medium">{c.name}</span>
                        {c.notes && (
                          <span className="max-w-xs truncate text-xs text-muted-foreground">
                            {c.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.phone || c.email ? (
                        <div className="grid gap-0.5 text-sm">
                          {c.phone && <span>{c.phone}</span>}
                          {c.email && <span className="truncate">{c.email}</span>}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.count === 0 ? <Badge variant="outline">none</Badge> : c.count}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {c.income > 0 ? `+${formatCurrency(c.income)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-rose-600 dark:text-rose-400">
                      {c.expenses > 0 ? `-${formatCurrency(c.expenses)}` : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium tabular-nums",
                        net < 0 && "text-destructive",
                      )}
                    >
                      {c.count === 0 ? "—" : formatCurrency(net)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${c.name}`}
                          onClick={() => setMode({ kind: "edit", client: c })}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${c.name}`}
                          onClick={() => setDeleting(c)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ClientDialog mode={mode} onClose={() => setMode(null)} />
      <DeleteDialog client={deleting} onClose={() => setDeleting(null)} />
    </Card>
  );
}

function ClientDialog({ mode, onClose }: { mode: Mode | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const editing = mode?.kind === "edit" ? mode.client : null;

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!mode) return;
    const form = new FormData(e.currentTarget);
    const input = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      notes: form.get("notes"),
    };
    startTransition(async () => {
      const result = editing
        ? await updateClientAction(editing.id, input)
        : await addClientAction(input);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        editing ? `Client "${result.data.name}" updated.` : `Client "${result.data.name}" added.`,
      );
      onClose();
    });
  }

  return (
    <Dialog open={mode !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        {mode && (
          // Keyed per client so the uncontrolled inputs start from its current values.
          <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit client" : "New client"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Changes apply to every transaction linked to this client."
                  : "Every transaction is recorded against a client."}
              </DialogDescription>
            </DialogHeader>
            <ClientFields client={editing} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save" : "Add client"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ClientFields({ client }: { client: Client | null }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="client-name">Name</Label>
        <Input
          id="client-name"
          name="name"
          placeholder="e.g. Acme Ltd"
          defaultValue={client?.name ?? ""}
          maxLength={CLIENT_NAME_MAX}
          autoFocus
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="client-phone">Phone</Label>
          <Input
            id="client-phone"
            name="phone"
            type="tel"
            placeholder="Optional"
            defaultValue={client?.phone ?? ""}
            maxLength={CLIENT_PHONE_MAX}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            name="email"
            type="email"
            placeholder="Optional"
            defaultValue={client?.email ?? ""}
            maxLength={CLIENT_EMAIL_MAX}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="client-notes">Notes</Label>
        <Textarea
          id="client-notes"
          name="notes"
          placeholder="Anything worth remembering about this client"
          defaultValue={client?.notes ?? ""}
          maxLength={CLIENT_NOTES_MAX}
          rows={3}
        />
      </div>
    </div>
  );
}

function DeleteDialog({
  client,
  onClose,
}: {
  client: ClientWithStats | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const inUse = (client?.count ?? 0) > 0;

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function handleDelete() {
    if (!client) return;
    startTransition(async () => {
      const result = await deleteClientAction(client.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast(`Client "${client.name}" deleted.`);
      onClose();
    });
  }

  return (
    <Dialog open={client !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        {client && (
          <>
            <DialogHeader>
              <DialogTitle>Delete “{client.name}”?</DialogTitle>
              <DialogDescription>
                {inUse
                  ? `This client is linked to ${client.count} ${client.count === 1 ? "transaction" : "transactions"}. Reassign or delete them before removing the client.`
                  : "This cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={pending || inUse}
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
