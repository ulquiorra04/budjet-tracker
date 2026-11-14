import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoriesManager } from "@/components/categories-manager";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listCategoriesWithStats } from "@/lib/categories";

export const metadata: Metadata = { title: "Categories · Budjet Tracker" };

async function CategoriesData() {
  await connection();
  return <CategoriesManager categories={listCategoriesWithStats()} />;
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1 h-3 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full sm:max-w-md" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="grid gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" description="Add, rename or remove transaction categories." />
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesData />
        </Suspense>
      </div>
    </>
  );
}
