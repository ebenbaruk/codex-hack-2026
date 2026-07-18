import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bot,
  Building2,
  Check,
  CircleDot,
  Database,
  FileCheck2,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/brand-mark";
import { demoCampaign } from "@/lib/buyable/engine";
import { sectorLabels } from "@/lib/buyable/data";

const previewTargets = demoCampaign.targets.slice(0, 3);
const funnel = demoCampaign.market_funnel;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(186,255,68,0.12),transparent_38%)]" />
      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <BrandMark />
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#conviction" className="transition-colors hover:text-foreground">
            Conviction engine
          </a>
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary"
          >
            Ginse Hackathon
          </Badge>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/campaigns/demo-lyon-services">
            Live conviction list
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-32 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1.5 text-xs font-medium text-primary">
            <Bot className="size-3.5" />
            Acquisition intelligence for Codex
          </div>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[5.1rem]">
            Know which business{" "}
            <span className="text-primary">is worth buying.</span>
          </h1>
          <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-muted-foreground">
            Buyable lets Codex scan the private market, prove why a target wins,
            and prepare the financing, seller approach and acquisition documents.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href="/campaigns/demo-lyon-services">
                Explore the killer demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <div className="flex h-12 items-center gap-2 px-4 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              €0.99 hackathon test balance
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-primary" /> 2,500 businesses scanned
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-primary" /> Every rank explained
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-primary" /> Deal Pack generated
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-primary/8 blur-3xl" />
          <Card className="relative overflow-hidden border-white/10 bg-card/88 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#ff625f]" />
                <span className="size-2.5 rounded-full bg-[#f3bd4f]" />
                <span className="size-2.5 rounded-full bg-primary" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Codex → Ginse → Buyable
              </span>
            </div>
            <CardContent className="p-0">
              <div className="border-b border-border bg-black/20 p-5 font-mono text-sm leading-6">
                <span className="text-primary">›</span>{" "}
                <span className="text-foreground">
                  Find the best HVAC and plumbing businesses around Lyon that I
                  could acquire with €250,000.
                </span>
              </div>
              <div className="grid grid-cols-5 border-b border-border bg-primary/[0.035]">
                {[
                  [funnel.universe_scanned, "scanned"],
                  [funnel.thesis_compatible, "thesis"],
                  [funnel.economically_solid, "quality"],
                  [funnel.financeable, "finance"],
                  [funnel.conviction_list, "top"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border-r border-border px-2 py-3 text-center last:border-0"
                  >
                    <p className="font-mono text-sm font-semibold text-primary">
                      {value}
                    </p>
                    <p className="mt-1 text-[7px] uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Acquisition conviction list</span>
                  <span>10 ranked · under 3s</span>
                </div>
                {previewTargets.map((target, index) => (
                  <div
                    key={target.id}
                    className={`group flex items-center gap-4 rounded-xl border p-4 ${
                      index === 0
                        ? "border-primary/35 bg-primary/[0.07]"
                        : "border-border bg-background/35"
                    }`}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background font-mono text-sm text-muted-foreground">
                      0{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{target.name}</p>
                        {index === 0 && (
                          <Badge className="h-5 bg-primary/12 px-1.5 text-[9px] text-primary">
                            WHY #1
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {target.city} · {sectorLabels[target.sector]} ·{" "}
                        {(target.estimated_financials.revenue_eur / 1_000_000).toFixed(1)}M€
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-semibold text-primary">
                        {target.conviction_score}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        conviction
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border bg-primary/[0.04] px-6 py-4 text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CircleDot className="size-3 text-primary" />
                  Synthetic hackathon demonstration data
                </span>
                <span className="font-mono text-primary">OPEN ANALYSIS ↗</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="relative border-y border-border bg-card/25">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                From private market to actionable deal
              </p>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em]">
                One prompt. The work of an acquisition team.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Codex remains the intelligence. Buyable supplies the market universe,
              evidence graph, financial calculations and persistent deal artifacts.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {[
              {
                icon: Database,
                number: "01",
                title: "Scan the market",
                text: "Search private businesses, including companies not listed for sale.",
              },
              {
                icon: Radar,
                number: "02",
                title: "Build the evidence",
                text: "Reconstruct financial, operating, contact and transition profiles.",
              },
              {
                icon: Target,
                number: "03",
                title: "Prove the ranking",
                text: "Explain every elimination and why #1 beats every alternative.",
              },
              {
                icon: FileCheck2,
                number: "04",
                title: "Prepare the deal",
                text: "Generate offer structures, outreach, lender memo, LOI and diligence.",
              },
            ].map((step) => (
              <div key={step.number} className="bg-background p-7">
                <div className="mb-12 flex items-center justify-between">
                  <step.icon className="size-5 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="conviction"
        className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="outline" className="mb-5 border-primary/25 text-primary">
              Conviction, not leads
            </Badge>
            <h2 className="text-4xl font-semibold tracking-[-0.04em]">
              “Best” has to be defensible.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Buyable separates company quality, buyer fit, financeability,
              operating transferability and observable transition evidence. It
              also shows confidence and unknowns separately.
            </p>
            <Button asChild variant="outline" className="mt-8 rounded-full">
              <Link href="/campaigns/demo-lyon-services">
                Inspect Why #1 wins
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Search,
                title: "Market funnel",
                text: "See exactly how 2,500 companies become ten conviction targets.",
              },
              {
                icon: Building2,
                title: "Evidence graph",
                text: "Facts, bounded inferences, provenance and critical unknowns.",
              },
              {
                icon: Banknote,
                title: "Live financeability",
                text: "Change buyer cash and watch the ranking and offer structures move.",
              },
              {
                icon: Sparkles,
                title: "Acquisition Deal Pack",
                text: "Investment memo, seller approach, financing, LOI and 100-day plan.",
              },
            ].map((item) => (
              <Card key={item.title} className="bg-card/50">
                <CardContent className="p-6">
                  <item.icon className="mb-8 size-5 text-primary" />
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center lg:px-8">
          <BrandMark compact />
          <p>Buyable · Acquisition intelligence for Codex</p>
          <p>Synthetic data · Drafts only · No outreach sent</p>
        </div>
      </footer>
    </main>
  );
}
