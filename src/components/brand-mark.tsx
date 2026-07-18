import Link from "next/link";
import { Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-[-0.03em]",
        compact ? "text-sm" : "text-lg",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:rotate-6",
          compact ? "size-7" : "size-8",
        )}
      >
        <Crosshair className={compact ? "size-3.5" : "size-4"} strokeWidth={2.4} />
      </span>
      <span>
        buyable<span className="text-primary">.</span>
      </span>
    </Link>
  );
}

