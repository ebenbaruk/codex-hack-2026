"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  FileJson,
  Gauge,
  Mail,
  MapPinned,
  MessageSquareText,
  Phone,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { CampaignOutput, QualifiedTarget } from "@/lib/buyable/types";
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
  thesis_fit: { label: "Thesis fit", max: 30 },
  economic_attractiveness: { label: "Economics", max: 20 },
  evidence_quality: { label: "Evidence", max: 20 },
  succession_signals: { label: "Succession signals", max: 15 },
  contactability: { label: "Contactability", max: 10 },
  data_completeness: { label: "Completeness", max: 5 },
} as const;

function ScoreRing({ score }: { score: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative size-[76px] shrink-0">
      <svg viewBox="0 0 72 72" className="size-full -rotate-90">
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
        <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em]">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {note}
        </p>
      </CardContent>
    </Card>
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
            <Badge className="h-4 rounded px-1 text-[8px] text-primary">TOP</Badge>
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
            {target.qualification_score}
          </span>
          <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">
            {target.confidence}% conf.
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

function EvidenceCard({
  label,
  detail,
  source,
  strength,
}: {
  label: string;
  detail: string;
  source: string;
  strength: "strong" | "medium" | "weak";
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-1 size-2 rounded-full",
              strength === "strong"
                ? "bg-primary"
                : strength === "medium"
                  ? "bg-amber-400"
                  : "bg-muted-foreground",
            )}
          />
          <div>
            <h4 className="text-sm font-medium">{label}</h4>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{detail}</p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-[8px] uppercase">
          {strength}
        </Badge>
      </div>
      <p className="mt-3 pl-5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">
        {source}
      </p>
    </div>
  );
}

export function CampaignDashboard({ campaign }: { campaign: CampaignOutput }) {
  const [selectedId, setSelectedId] = useState(campaign.top_target_id);
  const [sort, setSort] = useState("score");

  const sortedTargets = useMemo(() => {
    return [...campaign.targets].sort((a, b) => {
      if (sort === "confidence") return b.confidence - a.confidence;
      if (sort === "revenue") {
        return b.estimated_financials.revenue_eur - a.estimated_financials.revenue_eur;
      }
      return b.qualification_score - a.qualification_score;
    });
  }, [campaign.targets, sort]);

  const selected =
    campaign.targets.find((target) => target.id === selectedId) ?? campaign.targets[0];
  const selectedRank =
    sortedTargets.findIndex((target) => target.id === selected.id) + 1;
  const financing = campaign.financing_snapshot;

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-5">
            <BrandMark />
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <Link href="/" className="transition-colors hover:text-foreground">
                Campaigns
              </Link>
              <ChevronRight className="size-3" />
              <span className="font-medium text-foreground">Lyon local services</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden gap-1.5 border-primary/25 text-primary sm:flex">
              <ShieldCheck className="size-3" />
              Agent verified
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
          <span className="hidden sm:inline">No real companies · No outreach sent</span>
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
                Lyon local services
              </h1>
              <Badge className="bg-primary/10 text-primary">COMPLETED</Badge>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {campaign.thesis_summary}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <Bot className="size-3.5 text-primary" /> Invoked by Codex
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-3.5" /> 1.4 sec
            </span>
            <span className="flex items-center gap-2">
              <Euro className="size-3.5" /> 0.99 test balance
            </span>
          </div>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={Search} label="Universe scanned" value="40" note="synthetic companies" />
          <MetricCard icon={Radar} label="Qualified targets" value="10" note="off-market matches" />
          <MetricCard
            icon={Gauge}
            label="Top qualification"
            value={`${campaign.targets[0].qualification_score}/100`}
            note={`${campaign.targets[0].confidence}% confidence`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Pipeline revenue"
            value={compactEur.format(
              campaign.targets.reduce(
                (sum, target) => sum + target.estimated_financials.revenue_eur,
                0,
              ),
            )}
            note="synthetic estimate"
          />
          <MetricCard
            icon={Banknote}
            label="Top valuation"
            value={compactEur.format(financing.midpoint_valuation_eur)}
            note="midpoint scenario"
          />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
          <Card className="overflow-hidden bg-card/50">
            <CardHeader className="flex-row items-center justify-between border-b border-border py-4">
              <div>
                <CardTitle className="text-sm">Qualified target pipeline</CardTitle>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ranked by fit, economics, evidence, and contactability
                </p>
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 w-[135px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Qualification</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <div className="grid min-h-[560px] lg:grid-cols-[minmax(350px,.9fr)_minmax(320px,1.1fr)]">
              <ScrollArea className="h-[560px] border-b border-border lg:border-b-0 lg:border-r">
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
                  <div className="rounded-lg border border-border bg-background/30 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Region
                    </p>
                    <p className="mt-1.5 text-xs font-medium">{selected.city}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/30 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Founded
                    </p>
                    <p className="mt-1.5 font-mono text-xs font-medium">
                      {selected.founded_year}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/30 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Team
                    </p>
                    <p className="mt-1.5 font-mono text-xs font-medium">
                      ~{selected.employee_estimate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/25 text-primary">
                      #{selectedRank} MATCH
                    </Badge>
                    <Badge variant="secondary">{sectorLabels[selected.sector]}</Badge>
                  </div>
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
                <ScoreRing score={selected.qualification_score} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-background/35 p-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Revenue
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-semibold">
                    {compactEur.format(selected.estimated_financials.revenue_eur)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/35 p-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    EBITDA est.
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-semibold">
                    {compactEur.format(selected.estimated_financials.ebitda_eur)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/35 p-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Recurring
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-semibold">
                    {Math.round(selected.estimated_financials.recurring_revenue_ratio * 100)}%
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.045] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">Why Buyable surfaced it</p>
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="mt-3 space-y-2">
                  {selected.why_it_fits.slice(0, 3).map((reason) => (
                    <p key={reason} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {reason}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">Qualification model</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {selected.confidence}% evidence confidence
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
                  {Object.entries(selected.score_breakdown).map(([key, value]) => {
                    const config = breakdownLabels[key as keyof typeof breakdownLabels];
                    return (
                      <div key={key}>
                        <div className="mb-1.5 flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{config.label}</span>
                          <span className="font-mono">
                            {value}/{config.max}
                          </span>
                        </div>
                        <Progress value={(value / config.max) * 100} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6">
          <Tabs defaultValue="evidence">
            <div className="flex flex-col justify-between gap-3 border-b border-border sm:flex-row sm:items-center">
              <TabsList className="h-11 justify-start bg-transparent p-0">
                <TabsTrigger value="evidence" className="h-11 rounded-none px-4">
                  Evidence
                </TabsTrigger>
                <TabsTrigger value="underwriting" className="h-11 rounded-none px-4">
                  Underwriting
                </TabsTrigger>
                <TabsTrigger value="outreach" className="h-11 rounded-none px-4">
                  Outreach packet
                </TabsTrigger>
                <TabsTrigger value="json" className="h-11 rounded-none px-4">
                  Agent JSON
                </TabsTrigger>
              </TabsList>
              <p className="pb-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:pb-0">
                Target: {selected.id}
              </p>
            </div>

            <TabsContent value="evidence" className="mt-5">
              <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
                <div className="grid gap-3 md:grid-cols-2">
                  {selected.evidence.map((evidence) => (
                    <EvidenceCard key={evidence.id} {...evidence} />
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <Card className="bg-card/45">
                    <CardContent className="p-4">
                      <p className="flex items-center gap-2 text-xs font-medium">
                        <Building2 className="size-4 text-primary" /> What we know
                      </p>
                      <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                        {selected.evidence.slice(0, 3).map((item) => (
                          <li key={item.id}>• {item.detail}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/45">
                    <CardContent className="p-4">
                      <p className="flex items-center gap-2 text-xs font-medium">
                        <Radar className="size-4 text-amber-300" /> What we infer
                      </p>
                      <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                        {selected.inferences.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/45">
                    <CardContent className="p-4">
                      <p className="flex items-center gap-2 text-xs font-medium">
                        <CircleDot className="size-4 text-blue-300" /> What to verify
                      </p>
                      <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                        {selected.unknowns.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="underwriting" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Banknote className="size-4 text-primary" />
                      Illustrative financing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        ["Midpoint valuation", eur.format(financing.midpoint_valuation_eur)],
                        ["Buyer cash", eur.format(financing.buyer_cash_eur)],
                        ["Senior debt", eur.format(financing.senior_debt_eur)],
                        ["Seller note", eur.format(financing.seller_note_eur)],
                        ["Annual debt service", eur.format(financing.annual_debt_service_eur)],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-mono">{value}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.05] p-4">
                        <span>
                          <span className="block text-xs text-muted-foreground">
                            Estimated DSCR
                          </span>
                          <span className="mt-1 block text-xs">
                            Synthetic EBITDA / debt service
                          </span>
                        </span>
                        <span className="font-mono text-3xl font-semibold text-primary">
                          {financing.estimated_dscr.toFixed(2)}×
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="size-4 text-primary" />
                      Valuation logic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between rounded-xl border border-border bg-background/30 p-5">
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated range</p>
                        <p className="mt-2 font-mono text-2xl font-semibold">
                          {compactEur.format(selected.valuation_range_eur.low)} –{" "}
                          {compactEur.format(selected.valuation_range_eur.high)}
                        </p>
                      </div>
                      <Badge variant="outline">SYNTHETIC</Badge>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-muted-foreground">
                      {selected.valuation_range_eur.methodology}
                    </p>
                    <Separator className="my-5" />
                    <p className="text-xs leading-5 text-muted-foreground">
                      {financing.assumption}
                    </p>
                    <div className="mt-5 flex gap-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-3 text-[11px] leading-5 text-amber-100/65">
                      <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
                      {financing.disclaimer}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="outreach" className="mt-5">
              <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
                <Card className="bg-card/50">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-primary" />
                      Confidential first-contact email
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
                        First-call questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {campaign.outreach_packet.diligence_questions.map((question, index) => (
                          <li key={question} className="flex gap-3 text-xs leading-5">
                            <span className="font-mono text-primary">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="text-muted-foreground">{question}</span>
                          </li>
                        ))}
                      </ol>
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
                    Structured result returned to Codex
                  </CardTitle>
                  <CopyButton
                    value={JSON.stringify(campaign, null, 2)}
                    label="Copy JSON"
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[520px]">
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
          <span>Buyable — Team ELI · Ginse Hackathon Preview</span>
          <span className="flex items-center gap-2">
            Campaign {campaign.campaign_id.slice(0, 12)}
            <ArrowUpRight className="size-3" />
          </span>
        </footer>
      </div>
    </main>
  );
}
