import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/5">
          <Radar className="size-5 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
          Campaign not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This campaign does not exist or is no longer available.
        </p>
        <Button asChild className="mt-7 rounded-full">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Buyable
          </Link>
        </Button>
      </div>
    </main>
  );
}

