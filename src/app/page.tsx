import { Suspense } from "react";
import { connection } from "next/server";
import { BudgetTracker } from "@/components/budget-tracker";
import { TrackerSkeleton } from "@/components/tracker-skeleton";
import { listTransactions } from "@/lib/transactions";

async function TrackerData() {
  // Opt into request-time rendering: the list must come from SQLite on every request.
  await connection();
  const transactions = listTransactions();
  return <BudgetTracker transactions={transactions} />;
}

export default function Home() {
  return (
    <Suspense fallback={<TrackerSkeleton />}>
      <TrackerData />
    </Suspense>
  );
}
