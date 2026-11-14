import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoriesOverview } from "@/components/categories-overview";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryStats } from "@/lib/transactions";

export const metadata: Metadata = { title: "Categories · Budjet Tracker" };

async function CategoriesData() {
  await connection();
  return <CategoriesOverview stats={categoryStats()} />;
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-1 h-3 w-20" />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" description="How your transactions break down by category." />
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesData />
        </Suspense>
      </div>
    </>
  );
}
