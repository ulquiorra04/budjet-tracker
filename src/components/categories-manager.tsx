"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
} from "@/app/actions";
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
import type { CategoryWithStats } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import { CATEGORY_NAME_MAX } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function CategoriesManager({ categories }: { categories: CategoryWithStats[] }) {
  return (
    <div className="grid gap-6">
      <AddCategoryCard />
      <CategoriesTable categories={categories} />
    </div>
  );
}

function AddCategoryCard() {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addCategoryAction(name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Category "${result.data.name}" added.`);
      setName("");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New category</CardTitle>
        <CardDescription>Categories are available when adding a transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Label htmlFor="new-category" className="sr-only">
            Category name
          </Label>
          <Input
            id="new-category"
            placeholder="e.g. Subscriptions"
            maxLength={CATEGORY_NAME_MAX}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:max-w-xs"
          />
          <Button type="submit" disabled={pending || !name.trim()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add category
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CategoriesTable({ categories }: { categories: CategoryWithStats[] }) {
  const [renaming, setRenaming] = useState<CategoryWithStats | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithStats | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No categories yet. Add one above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => {
                const net = c.income - c.expenses;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.count === 0 ? (
                        <Badge variant="outline">unused</Badge>
                      ) : (
                        c.count
                      )}
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
                          aria-label={`Rename ${c.name}`}
                          onClick={() => setRenaming(c)}
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

      <RenameDialog category={renaming} onClose={() => setRenaming(null)} />
      <DeleteDialog category={deleting} onClose={() => setDeleting(null)} />
    </Card>
  );
}

function RenameDialog({
  category,
  onClose,
}: {
  category: CategoryWithStats | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category) return;
    const name = new FormData(e.currentTarget).get("name");
    startTransition(async () => {
      const result = await renameCategoryAction(category.id, name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Renamed to "${result.data.name}".`);
      onClose();
    });
  }

  return (
    <Dialog open={category !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        {category && (
          // Keyed per category so the uncontrolled input starts from its current name.
          <form key={category.id} onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Rename category</DialogTitle>
              <DialogDescription>
                {category.count > 0
                  ? `This will update ${category.count} existing ${category.count === 1 ? "transaction" : "transactions"}.`
                  : "This category has no transactions yet."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="rename-category">Name</Label>
              <Input
                id="rename-category"
                name="name"
                defaultValue={category.name}
                maxLength={CATEGORY_NAME_MAX}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  category,
  onClose,
}: {
  category: CategoryWithStats | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const inUse = (category?.count ?? 0) > 0;

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  function handleDelete() {
    if (!category) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast(`Category "${category.name}" deleted.`);
      onClose();
    });
  }

  return (
    <Dialog open={category !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        {category && (
          <>
            <DialogHeader>
              <DialogTitle>Delete “{category.name}”?</DialogTitle>
              <DialogDescription>
                {inUse
                  ? `This category is used by ${category.count} ${category.count === 1 ? "transaction" : "transactions"}. Move or delete them before removing it.`
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
