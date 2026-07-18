"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QualifiedTarget } from "@/lib/buyable/types";

function position(target: QualifiedTarget) {
  const x = ((target.longitude - 3.85) / (6.45 - 3.85)) * 100;
  const y = ((46.45 - target.latitude) / (46.45 - 44.65)) * 100;
  return {
    left: `${Math.min(92, Math.max(8, x))}%`,
    top: `${Math.min(88, Math.max(10, y))}%`,
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
    <div className="relative aspect-[1.25/1] overflow-hidden rounded-xl border border-border bg-[#0d110f]">
      <svg
        viewBox="0 0 600 480"
        className="absolute inset-0 size-full opacity-75"
        aria-hidden="true"
      >
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,.045)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="region-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(186,255,68,.14)" />
            <stop offset="100%" stopColor="rgba(186,255,68,.025)" />
          </linearGradient>
        </defs>
        <rect width="600" height="480" fill="url(#map-grid)" />
        <path
          d="M81 164 L121 77 L218 55 L297 79 L355 48 L442 81 L493 143 L552 185 L526 250 L558 325 L494 403 L390 422 L319 394 L241 435 L157 403 L102 341 L51 289 Z"
          fill="url(#region-fill)"
          stroke="rgba(186,255,68,.28)"
          strokeWidth="2"
        />
        <path
          d="M66 300 C160 244 217 214 310 232 C403 250 460 203 540 161"
          fill="none"
          stroke="rgba(108,159,255,.22)"
          strokeWidth="3"
          strokeDasharray="5 8"
        />
        <text x="286" y="205" fill="rgba(255,255,255,.22)" fontSize="12" letterSpacing="4">
          AUVERGNE
        </text>
        <text x="270" y="225" fill="rgba(255,255,255,.22)" fontSize="12" letterSpacing="4">
          RHÔNE-ALPES
        </text>
      </svg>

      <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/45 px-3 py-2 backdrop-blur">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          Target density
        </p>
        <p className="mt-1 text-xs font-medium">10 qualified businesses</p>
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
              "group absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110",
              selected && "z-20 scale-110",
            )}
          >
            <span
              className={cn(
                "relative flex size-7 items-center justify-center rounded-full border bg-background shadow-lg transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-primary/20"
                  : "border-white/20 text-muted-foreground group-hover:border-primary/60 group-hover:text-primary",
              )}
            >
              {selected && (
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30" />
              )}
              {index === 0 ? (
                <MapPin className="size-3.5" fill="currentColor" />
              ) : (
                <span className="font-mono text-[9px] font-semibold">{index + 1}</span>
              )}
            </span>
          </button>
        );
      })}

      <div className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="size-2 rounded-full bg-primary" />
        Click a signal to inspect
      </div>
    </div>
  );
}
