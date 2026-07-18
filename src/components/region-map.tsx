"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QualifiedTarget } from "@/lib/buyable/types";

function position(target: QualifiedTarget) {
  const x = ((target.longitude + 5.5) / 15.5) * 100;
  const y = ((51.4 - target.latitude) / 10.6) * 100;
  return {
    left: `${Math.min(92, Math.max(8, x))}%`,
    top: `${Math.min(90, Math.max(8, y))}%`,
  };
}

export function RegionMap({
  targets,
  selectedId,
  onSelect,
}: {
  targets: QualifiedTarget[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative aspect-[1.25/1] overflow-hidden border border-foreground bg-background">
      <svg
        viewBox="0 0 600 480"
        className="absolute inset-0 size-full opacity-80"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="france-map-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,.045)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="600" height="480" fill="url(#france-map-grid)" />
        <path
          d="M204 54 L273 64 L323 48 L382 78 L430 72 L469 115 L501 156 L485 208 L514 251 L484 302 L452 344 L399 363 L367 415 L316 421 L281 387 L232 382 L206 337 L157 315 L143 260 L104 222 L126 172 L116 122 L161 94 Z"
          fill="rgba(255,90,31,.08)"
          stroke="rgba(255,90,31,.7)"
          strokeWidth="1"
        />
        <path
          d="M466 385 C480 375 493 381 494 401 C495 424 483 451 470 456 C459 445 458 404 466 385 Z"
          fill="rgba(255,90,31,.08)"
          stroke="rgba(255,90,31,.7)"
          strokeWidth="1"
        />
        <path
          d="M154 282 C244 246 313 230 403 246 C443 254 472 239 497 215"
          fill="none"
          stroke="rgba(241,241,241,.12)"
          strokeWidth="1"
          strokeDasharray="5 8"
        />
        <text
          x="270"
          y="226"
          fill="rgba(255,255,255,.2)"
          fontSize="13"
          letterSpacing="6"
        >
          FRANCE
        </text>
      </svg>

      <div className="absolute left-4 top-4 border border-border bg-background px-3 py-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          Conviction density
        </p>
        <p className="mt-1 text-xs font-medium">
          {targets.length} curated businesses
        </p>
      </div>

      {targets.map((target, index) => {
        const selected = target.id === selectedId;
        return (
          <button
            key={target.id}
            type="button"
            aria-label={`Select ${target.name}`}
            aria-pressed={selected}
            onClick={() => onSelect(target.id)}
            style={position(target)}
            className={cn(
              "group absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-colors",
              selected && "z-20",
            )}
          >
            <span
              className={cn(
                "relative flex size-7 items-center justify-center border bg-background transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground group-hover:border-foreground group-hover:bg-foreground group-hover:text-background",
              )}
            >
              {index === 0 ? (
                <MapPin className="size-3.5" fill="currentColor" />
              ) : (
                <span className="font-mono text-[9px] font-semibold">
                  {index + 1}
                </span>
              )}
            </span>
          </button>
        );
      })}

      <div className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="size-2 bg-primary" />
        Click a target to inspect
      </div>
    </div>
  );
}
