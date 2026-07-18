import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md border border-foreground bg-card p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center border border-primary bg-primary text-primary-foreground">
          <Radar className="size-5 text-primary-foreground" />
        </div>
        <h1 className="font-display mt-6 text-4xl tracking-[-0.02em]">
          Campaign not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This campaign does not exist or is no longer available.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Buyable
          </Link>
        </Button>
      </div>
    </main>
  );
}
