import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function TrackerSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Block className="h-10 w-48" />
        <Block className="h-8 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Block className="h-4 w-20" />
              <Block className="mt-2 h-7 w-32" />
            </CardHeader>
            <CardContent>
              <Block className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <Block className="h-5 w-32" />
          </CardHeader>
          <CardContent className="grid gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Block key={i} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-6 content-start">
          <Card>
            <CardHeader>
              <Block className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Block className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
