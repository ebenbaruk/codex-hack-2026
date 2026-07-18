import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignLoading() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Skeleton className="h-12 w-52" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[580px] w-full" />
      </div>
    </main>
  );
}

