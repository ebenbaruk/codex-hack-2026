"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDot,
  Clock3,
  Euro,
  FileCheck2,
  FileJson,
  FileText,
  Gauge,
  Landmark,
  Mail,
  MapPinned,
  MessageSquareText,
  Phone,
  Radar,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandMark } from "@/components/brand-mark";
import { CopyButton } from "@/components/copy-button";
import { RegionMap } from "@/components/region-map";
import { sectorLabels } from "@/lib/buyable/data";
import { buildOfferScenarios } from "@/lib/buyable/finance";
import { simulateConvictionRanking } from "@/lib/buyable/simulation";
import type {
  CampaignOutput,
  EvidenceSignal,
  QualifiedTarget,
} from "@/lib/buyable/types";
import { cn } from "@/lib/utils";

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const compactEur = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 1,
});

const breakdownLabels = {
  economic_quality: { label: "Economic quality", max: 25 },
  buyer_fit: { label: "Buyer fit", max: 20 },
  financeability: { label: "Financeability", max: 20 },
  operational_transferability: { label: "Transferability", max: 15 },
  transition_signals: { label: "Transition evidence", max: 10 },
  contactability: { label: "Contactability", max: 5 },
  data_completeness: { label: "Completeness", max: 5 },
} as const;

const funnelLabels = [
  ["universe_scanned", "Universe scanned"],
  ["thesis_compatible", "Thesis compatible"],
  ["economically_solid", "Economically solid"],
  ["financeable", "Financeable"],
  ["transition_relevant", "Transition relevant"],
  ["conviction_list", "Conviction list"],
] as const;

function ScoreRing({ score }: { score: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative size-[76px] shrink-0">
      <svg viewBox="0 0 72 72" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.08)"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-semibold text-primary">
        {score}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="bg-card/55">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" />
        </div>
        <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em]">
          {value}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {note}
        </p>
      </CardContent>
    </Card>
  );
}

function EvidenceCard({ evidence }: { evidence: EvidenceSignal }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-1 size-2 rounded-full",
              evidence.strength === "strong"
                ? "bg-primary"
                : evidence.strength === "medium"
                  ? "bg-amber-400"
                  : "bg-muted-foreground",
            )}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium">{evidence.label}</h4>
              <Badge variant="outline" className="text-[8px] uppercase">
                {evidence.classification}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              {evidence.detail}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-[8px] uppercase">
          {evidence.strength}
        </Badge>
      </div>
      <p className="mt-3 pl-5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">
        {evidence.source} · {evidence.observed_at}
      </p>
    </div>
  );
}

function TargetRow({
  target,
  rank,
  selected,
  onSelect,
}: {
  target: QualifiedTarget;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Inspect ${target.name}, ranked ${rank}`}
      aria-pressed={selected}
      className={cn(
        "group grid w-full grid-cols-[34px_1fr_auto] items-center gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0",
        selected ? "bg-primary/[0.075]" : "hover:bg-white/[0.025]",
      )}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-md border font-mono text-[10px]",
          selected
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground",
        )}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{target.name}</span>
          {rank === 1 && (
            <Badge className="h-4 rounded px-1 text-[8px] text-primary">
              CONVICTION
            </Badge>
          )}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {target.city}
          <span className="text-border">/</span>
          {sectorLabels[target.sector]}
          <span className="text-border">/</span>
          {compactEur.format(target.estimated_financials.revenue_eur)}
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span className="text-right">
          <span className="block font-mono text-lg font-semibold text-primary">
            {target.conviction_score}
          </span>
          <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">
            {target.confidence}% confidence
          </span>
        </span>
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            selected && "translate-x-0.5 text-primary",
          )}
        />
      </span>
    </button>
  );
}

function ListCard({
  title,
  icon: Icon,
  items,
  tone = "primary",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  tone?: "primary" | "warning" | "neutral";
}) {
  return (
    <Card className="bg-card/45">
      <CardContent className="p-4">
        <p className="flex items-center gap-2 text-xs font-medium">
          <Icon
            className={cn(
              "size-4",
              tone === "primary"
                ? "text-primary"
                : tone === "warning"
                  ? "text-amber-300"
                  : "text-blue-300",
            )}
          />
          {title}
        </p>
        <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CampaignDashboard({ campaign }: { campaign: CampaignOutput }) {
  const originalCash = campaign.applied_filters.cash_available_eur;
  const [cash, setCash] = useState(originalCash);
  const [selectedId, setSelectedId] = useState(campaign.top_target_id);
  const [sort, setSort] = useState("conviction");

  const simulatedTargets = useMemo(
    () => simulateConvictionRanking(campaign.targets, cash),
    [campaign.targets, cash],
  );
  const sortedTargets = useMemo(() => {
    return [...simulatedTargets].sort((a, b) => {
      if (sort === "confidence") return b.confidence - a.confidence;
      if (sort === "revenue") {
        return (
          b.estimated_financials.revenue_eur -
          a.estimated_financials.revenue_eur
        );
      }
      if (sort === "financeability") {
        return (
          b.score_breakdown.financeability -
          a.score_breakdown.financeability
        );
      }
      return b.conviction_score - a.conviction_score;
    });
  }, [simulatedTargets, sort]);
  const selected =
    simulatedTargets.find((target) => target.id === selectedId) ??
    simulatedTargets[0];
  const selectedRank =
    sortedTargets.findIndex((target) => target.id === selected.id) + 1;
  const scenarios = useMemo(
    () => buildOfferScenarios(selected, cash),
    [cash, selected],
  );
  const isSimulated = cash !== originalCash;
  const topTarget = campaign.targets.find(
    (target) => target.id === campaign.top_target_id,
  )!;
  const acquisitionCase = campaign.top_acquisition_case;

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-5">
            <BrandMark />
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <Link href="/" className="transition-colors hover:text-foreground">
                Intelligence
              </Link>
              <ChevronRight className="size-3" />
              <span className="font-medium text-foreground">
                Lyon acquisition search
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden gap-1.5 border-primary/25 text-primary sm:flex"
            >
              <ShieldCheck className="size-3" />
              Evidence traced
            </Badge>
            <CopyButton
              value={campaign.campaign_url}
              label="Share campaign"
              className="rounded-full"
            />
          </div>
        </div>
      </nav>

      <div className="border-b border-amber-400/15 bg-amber-400/[0.045]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-amber-200/75 lg:px-6">
          <span className="flex items-center gap-2">
            <CircleAlert className="size-3.5" />
            {campaign.disclosure}
          </span>
          <span className="hidden sm:inline">
            No real companies · No owner-age inference · No outreach sent
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6 lg:py-8">
        <header className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to Buyable
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Acquisition conviction list
              </h1>
              <Badge className="bg-primary/10 text-primary">ANALYSIS COMPLETE</Badge>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
              {campaign.thesis_summary}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <Bot className="size-3.5 text-primary" /> Curated for Codex
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-3.5" /> Under 3 sec
            </span>
            <span className="flex items-center gap-2">
              <Euro className="size-3.5" /> €0.99
            </span>
          </div>
        </header>

        <section
          aria-label="Market qualification funnel"
          className="mt-7 grid overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 xl:grid-cols-6"
        >
          {funnelLabels.map(([key, label], index) => (
            <div
              key={key}
              className="relative bg-card px-4 py-4 xl:min-h-[112px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted-foreground">
                  0{index + 1}
                </span>
                {index < funnelLabels.length - 1 && (
                  <ArrowRight className="hidden size-3 text-muted-foreground/50 xl:block" />
                )}
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold text-primary">
                {campaign.market_funnel[key].toLocaleString("fr-FR")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Gauge}
            label="Top conviction"
            value={`${simulatedTargets[0].conviction_score}/100`}
            note={`${simulatedTargets[0].confidence}% evidence confidence`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Top revenue"
            value={compactEur.format(
              simulatedTargets[0].estimated_financials.revenue_eur,
            )}
            note="2025 synthetic estimate"
          />
          <MetricCard
            icon={Banknote}
            label="Top valuation"
            value={compactEur.format(
              simulatedTargets[0].valuation_range_eur.midpoint,
            )}
            note="illustrative enterprise value"
          />
          <MetricCard
            icon={Radar}
            label="Transition evidence"
            value={`${simulatedTargets[0].score_breakdown.transition_signals}/10`}
            note="observable signals only"
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)]">
          <Card className="overflow-hidden bg-card/50">
            <CardHeader className="flex-row items-center justify-between border-b border-border py-4">
              <div>
                <CardTitle className="text-sm">Buyability ranking</CardTitle>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  The ten businesses Codex should investigate first
                </p>
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 w-[145px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conviction">Conviction</SelectItem>
                  <SelectItem value="financeability">Financeability</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <div className="grid min-h-[580px] lg:grid-cols-[minmax(350px,.92fr)_minmax(320px,1.08fr)]">
              <ScrollArea className="h-[580px] border-b border-border lg:border-b-0 lg:border-r">
                {sortedTargets.map((target, index) => (
                  <TargetRow
                    key={target.id}
                    target={target}
                    rank={index + 1}
                    selected={target.id === selected.id}
                    onSelect={() => setSelectedId(target.id)}
                  />
                ))}
              </ScrollArea>
              <div className="p-4">
                <RegionMap
                  targets={sortedTargets}
                  selectedId={selected.id}
                  onSelect={setSelectedId}
                />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["Region", selected.city],
                    ["Founded", String(selected.founded_year)],
                    ["Team", `~${selected.employee_estimate}`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-background/30 p-3"
                    >
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1.5 truncate font-mono text-xs font-medium">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="border-primary/20 bg-primary/[0.045]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <Badge className="mb-3 bg-primary/10 text-primary">
                      WHY #{selectedRank}
                    </Badge>
                    <h2 className="text-2xl font-semibold tracking-[-0.035em]">
                      {selected.name}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPinned className="size-3.5" />
                      {selected.city}, {selected.department}
                      <span>·</span>
                      Not listed for sale
                    </p>
                  </div>
                  <ScoreRing score={selected.conviction_score} />
                </div>
                <p className="mt-5 rounded-xl border border-primary/15 bg-background/30 p-4 text-sm leading-6 text-muted-foreground">
                  {selected.rank_explanation}
                </p>
                <div className="mt-4 space-y-2">
                  {selected.why_buy.slice(0, 3).map((reason) => (
                    <p
                      key={reason}
                      className="flex gap-2 text-xs leading-5 text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {reason}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="size-4 text-primary" />
                  Live buyer-cash simulation
                  {isSimulated && (
                    <Badge className="ml-auto bg-blue-400/10 text-blue-300">
                      WHAT-IF
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <label className="flex-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Available cash
                    <Input
                      aria-label="Available buyer cash"
                      type="number"
                      min={50_000}
                      max={2_000_000}
                      step={25_000}
                      value={cash}
                      onChange={(event) =>
                        setCash(
                          Math.max(
                            50_000,
                            Math.min(2_000_000, Number(event.target.value)),
                          ),
                        )
                      }
                      className="mt-2 font-mono"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Reset buyer cash"
                    onClick={() => setCash(originalCash)}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <Input
                  aria-label="Buyer cash slider"
                  type="range"
                  min={50_000}
                  max={1_000_000}
                  step={25_000}
                  value={cash}
                  onChange={(event) => setCash(Number(event.target.value))}
                  className="mt-4 h-2 cursor-pointer border-0 bg-transparent p-0 accent-[var(--primary)]"
                />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    ["New rank", `#${selectedRank}`],
                    [
                      "Finance score",
                      `${selected.score_breakdown.financeability}/20`,
                    ],
                    [
                      "Equity gap",
                      compactEur.format(selected.financeability.equity_gap_eur),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-background/30 p-3"
                    >
                      <p className="font-mono text-sm font-semibold">{value}</p>
                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                Why #1 wins
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {campaign.ranking_explanation.why_number_one_wins.map(
                (reason, index) => (
                  <div
                    key={reason}
                    className="flex gap-3 rounded-xl border border-border bg-background/35 p-4"
                  >
                    <span className="font-mono text-xs text-primary">
                      0{index + 1}
                    </span>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {reason}
                    </p>
                  </div>
                ),
              )}
              <p className="sm:col-span-2 text-[10px] leading-5 text-muted-foreground">
                {campaign.ranking_explanation.limitation}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Search className="size-4 text-primary" />
                Why the market was rejected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaign.rejection_reasons.slice(0, 5).map((rejection) => (
                <div
                  key={rejection.reason}
                  className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0"
                >
                  <div>
                    <p className="text-xs font-medium">{rejection.reason}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {rejection.detail}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    {rejection.count.toLocaleString("fr-FR")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6">
          <Tabs defaultValue="company">
            <div className="border-b border-border">
              <ScrollArea className="w-full">
                <TabsList className="h-11 w-max justify-start bg-transparent p-0">
                  {[
                    ["company", "Company"],
                    ["economics", "Economics"],
                    ["evidence", "Evidence"],
                    ["financing", "Financing"],
                    ["seller", "Seller approach"],
                    ["documents", "Documents"],
                    ["json", "Agent JSON"],
                  ].map(([value, label]) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="h-11 rounded-none px-4"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            <TabsContent value="company" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-3">
                <ListCard
                  title="What we know"
                  icon={Building2}
                  items={selected.facts}
                />
                <ListCard
                  title="What we infer"
                  icon={Radar}
                  items={selected.inferences}
                  tone="warning"
                />
                <ListCard
                  title="What must be verified"
                  icon={CircleDot}
                  items={selected.unknowns}
                  tone="neutral"
                />
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Gauge className="size-4 text-primary" />
                      Acquisition conviction model
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {Object.entries(selected.score_breakdown).map(
                      ([key, value]) => {
                        const config =
                          breakdownLabels[key as keyof typeof breakdownLabels];
                        return (
                          <div key={key}>
                            <div className="mb-1.5 flex justify-between text-[10px]">
                              <span className="text-muted-foreground">
                                {config.label}
                              </span>
                              <span className="font-mono">
                                {value}/{config.max}
                              </span>
                            </div>
                            <Progress
                              value={(value / config.max) * 100}
                              className="h-1"
                            />
                          </div>
                        );
                      },
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="size-4 text-primary" />
                      Verified contact paths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selected.contact_paths.map((contact) => (
                      <div
                        key={`${contact.channel}-${contact.value}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/30 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium">{contact.role}</p>
                          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                            {contact.value}
                          </p>
                        </div>
                        <Badge variant="outline">{contact.confidence}%</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="economics" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="size-4 text-primary" />
                      Three-year synthetic financials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="pb-3 font-medium">Year</th>
                            <th className="pb-3 text-right font-medium">Revenue</th>
                            <th className="pb-3 text-right font-medium">EBITDA</th>
                            <th className="pb-3 text-right font-medium">Margin</th>
                            <th className="pb-3 text-right font-medium">Free cash flow</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.estimated_financials.financial_history.map(
                            (year) => (
                              <tr key={year.year} className="border-t border-border">
                                <td className="py-4 font-mono">{year.year}</td>
                                <td className="py-4 text-right font-mono">
                                  {eur.format(year.revenue_eur)}
                                </td>
                                <td className="py-4 text-right font-mono">
                                  {eur.format(year.ebitda_eur)}
                                </td>
                                <td className="py-4 text-right font-mono">
                                  {Math.round(year.ebitda_margin * 100)}%
                                </td>
                                <td className="py-4 text-right font-mono text-primary">
                                  {eur.format(year.free_cash_flow_eur)}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Scale className="size-4 text-primary" />
                      Valuation range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-3xl font-semibold">
                      {compactEur.format(selected.valuation_range_eur.low)} –{" "}
                      {compactEur.format(selected.valuation_range_eur.high)}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {selected.valuation_range_eur.methodology}
                    </p>
                    <Separator className="my-5" />
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        [
                          "Recurring",
                          `${Math.round(selected.estimated_financials.recurring_revenue_ratio * 100)}%`,
                        ],
                        [
                          "Top customer",
                          `${Math.round(selected.estimated_financials.customer_concentration_ratio * 100)}%`,
                        ],
                        [
                          "Capex",
                          `${(selected.estimated_financials.maintenance_capex_ratio * 100).toFixed(1)}%`,
                        ],
                        [
                          "3Y CAGR",
                          `${Math.round(selected.estimated_financials.three_year_revenue_cagr * 100)}%`,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-lg border border-border bg-background/30 p-3"
                        >
                          <p className="font-mono text-lg">{value}</p>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="mt-5">
              <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
                <div className="grid gap-3 md:grid-cols-2">
                  {selected.evidence.map((evidence) => (
                    <EvidenceCard key={evidence.id} evidence={evidence} />
                  ))}
                </div>
                <Card className="h-fit bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Radar className="size-4 text-primary" />
                      Observable transition signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selected.transition_signals.map((signal) => (
                      <div
                        key={`${signal.type}-${signal.detail}`}
                        className="rounded-xl border border-border bg-background/35 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-medium">{signal.label}</p>
                          <Badge variant="outline">{signal.strength}</Badge>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {signal.detail}
                        </p>
                        <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
                          {signal.source} · {signal.observed_at}
                        </p>
                      </div>
                    ))}
                    <p className="text-[10px] leading-5 text-muted-foreground">
                      These signals justify research and respectful outreach only.
                      They do not predict a sale or infer the owner’s age.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financing" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-3">
                {scenarios.map((scenario) => (
                  <Card
                    key={scenario.id}
                    className={cn(
                      "bg-card/50",
                      scenario.id === "balanced" && "border-primary/25",
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-sm">{scenario.label}</CardTitle>
                        <Badge
                          className={
                            scenario.feasible
                              ? "bg-primary/10 text-primary"
                              : "bg-amber-400/10 text-amber-300"
                          }
                        >
                          {scenario.feasible ? "FEASIBLE" : "STRETCH"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          ["Enterprise value", scenario.enterprise_value_eur],
                          ["Buyer cash", scenario.buyer_cash_eur],
                          ["Senior debt", scenario.senior_debt_eur],
                          ["Seller note", scenario.seller_note_eur],
                          ["Earn-out", scenario.earnout_eur],
                          ["Seller cash at close", scenario.seller_cash_at_close_eur],
                        ].map(([label, value]) => (
                          <div
                            key={String(label)}
                            className="flex justify-between border-b border-border pb-2 text-xs last:border-0"
                          >
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-mono">
                              {eur.format(Number(value))}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-end justify-between rounded-xl border border-primary/15 bg-primary/[0.045] p-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            Estimated DSCR
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Synthetic scenario
                          </p>
                        </div>
                        <p className="font-mono text-3xl font-semibold text-primary">
                          {scenario.estimated_dscr.toFixed(2)}×
                        </p>
                      </div>
                      <p className="mt-4 text-xs leading-5 text-muted-foreground">
                        {scenario.rationale}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="mt-4 flex gap-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-3 text-[11px] leading-5 text-amber-100/65">
                <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
                {campaign.financing_snapshot.disclaimer}
              </p>
            </TabsContent>

            <TabsContent value="seller" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
                <Card className="bg-card/50">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-primary" />
                      Confidential first-contact email for {topTarget.name}
                    </CardTitle>
                    <CopyButton
                      value={`Objet : ${campaign.outreach_packet.email_subject}\n\n${campaign.outreach_packet.email_body}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-border bg-background/45 p-5">
                      <p className="border-b border-border pb-3 text-xs">
                        <span className="text-muted-foreground">Objet:</span>{" "}
                        {campaign.outreach_packet.email_subject}
                      </p>
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                        {campaign.outreach_packet.email_body}
                      </p>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <ShieldCheck className="size-3 text-primary" />
                      Prepared only. Buyable never sends outreach.
                    </p>
                  </CardContent>
                </Card>
                <div className="space-y-5">
                  <Card className="bg-card/50">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 text-primary" />
                        Call opener
                      </CardTitle>
                      <CopyButton value={campaign.outreach_packet.call_opener} />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        “{campaign.outreach_packet.call_opener}”
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <MessageSquareText className="size-4 text-primary" />
                        First-meeting questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {campaign.outreach_packet.first_meeting_questions.map(
                          (question, index) => (
                            <li
                              key={question}
                              className="flex gap-3 text-xs leading-5"
                            >
                              <span className="font-mono text-primary">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="text-muted-foreground">
                                {question}
                              </span>
                            </li>
                          ),
                        )}
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
                <Card className="h-fit bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileCheck2 className="size-4 text-primary" />
                      Acquisition Deal Pack
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaign.generated_artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium">{artifact.title}</p>
                            <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                              Professional review required
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">DRAFT</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="space-y-5">
                  <Card className="bg-card/50">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Landmark className="size-4 text-primary" />
                        Investment memo
                      </CardTitle>
                      <CopyButton
                        value={[
                          acquisitionCase.executive_summary,
                          ...acquisitionCase.investment_thesis,
                          ...acquisitionCase.key_risks,
                        ].join("\n\n")}
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {acquisitionCase.executive_summary}
                      </p>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <ListCard
                          title="Investment thesis"
                          icon={CheckCircle2}
                          items={acquisitionCase.investment_thesis}
                        />
                        <ListCard
                          title="Deal breakers"
                          icon={CircleAlert}
                          items={acquisitionCase.deal_breakers}
                          tone="warning"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Scale className="size-4 text-primary" />
                        Non-binding LOI draft
                      </CardTitle>
                      <CopyButton value={acquisitionCase.loi_draft} />
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line rounded-xl border border-border bg-background/35 p-5 font-mono text-[11px] leading-6 text-muted-foreground">
                        {acquisitionCase.loi_draft}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <CalendarDays className="size-4 text-primary" />
                        First 100 days
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                      {acquisitionCase.hundred_day_plan.map((phase) => (
                        <div
                          key={phase.phase}
                          className="rounded-xl border border-border bg-background/35 p-4"
                        >
                          <Badge variant="outline">{phase.days}</Badge>
                          <p className="mt-3 text-sm font-medium">{phase.phase}</p>
                          <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                            {phase.priorities.map((priority) => (
                              <li key={priority}>• {priority}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="json" className="mt-5">
              <Card className="overflow-hidden bg-[#090b0a]">
                <CardHeader className="flex-row items-center justify-between border-b border-border">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileJson className="size-4 text-primary" />
                    Structured acquisition intelligence returned to Codex
                  </CardTitle>
                  <CopyButton
                    value={JSON.stringify(campaign, null, 2)}
                    label="Copy JSON"
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[560px]">
                    <pre className="p-5 font-mono text-[11px] leading-5 text-[#b4c6b9]">
                      {JSON.stringify(campaign, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <footer className="mt-10 flex flex-col justify-between gap-4 border-t border-border py-6 text-[10px] uppercase tracking-[0.13em] text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5" />
            Generated {new Date(campaign.generated_at).toLocaleString("en-GB")}
          </span>
          <span>Buyable · Acquisition intelligence for Codex</span>
          <span className="flex items-center gap-2">
            Campaign {campaign.campaign_id.slice(0, 12)}
            <ArrowUpRight className="size-3" />
          </span>
        </footer>
      </div>
    </main>
  );
}
