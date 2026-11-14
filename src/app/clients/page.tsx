import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ClientsManager } from "@/components/clients-manager";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listClientsWithStats } from "@/lib/clients";

export const metadata: Metadata = { title: "Clients · Budjet Tracker" };

async function ClientsData() {
  await connection();
  return <ClientsManager clients={listClientsWithStats()} />;
}

function ClientsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-1 h-3 w-40" />
      </CardHeader>
      <CardContent className="grid gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  return (
    <>
      <PageHeader title="Clients" description="Keep track of who you work with." />
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <Suspense fallback={<ClientsSkeleton />}>
          <ClientsData />
        </Suspense>
      </div>
    </>
  );
}
