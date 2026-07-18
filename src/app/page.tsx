import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  CircleDot,
  Database,
  Radar,
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
          <a href="#proof" className="transition-colors hover:text-foreground">
            Qualification engine
          </a>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            Ginse Hackathon
          </Badge>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/campaigns/demo-lyon-services">
            Live campaign
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:pb-32 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1.5 text-xs font-medium text-primary">
            <Bot className="size-3.5" />
            The acquisition engine Codex can call
          </div>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[5.4rem]">
            Find the business{" "}
            <span className="text-primary">before it&apos;s for sale.</span>
          </h1>
          <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-muted-foreground">
            Buyable turns an acquisition thesis into ten evidence-backed,
            off-market targets—qualified, ranked, and ready for a confidential
            first conversation.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href="/campaigns/demo-lyon-services">
                Explore the live result
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
              <Check className="size-3.5 text-primary" /> Evidence, not guesses
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-primary" /> No outreach sent
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-3.5 text-primary" /> Agent-native JSON
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
                  Use Buyable to find HVAC and plumbing businesses around Lyon
                  that I could acquire with €250,000 of cash.
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Qualified off-market targets</span>
                  <span>10 found · 1.4s</span>
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
                            TOP MATCH
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
                        {target.qualification_score}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        score
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
                <span className="font-mono text-primary">OPEN CAMPAIGN ↗</span>
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
                Agent-native deal sourcing
              </p>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em]">
                One prompt. A pipeline you can act on.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Codex stays the user. Buyable supplies the specialized data,
              qualification logic, and transaction-ready artifacts that a general
              agent does not have.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {[
              {
                icon: Target,
                number: "01",
                title: "State the thesis",
                text: "Region, sectors, budget, revenue range, and operator profile.",
              },
              {
                icon: Database,
                number: "02",
                title: "Scan weak signals",
                text: "Commercial, registry, hiring, digital, and operating evidence.",
              },
              {
                icon: Radar,
                number: "03",
                title: "Qualify targets",
                text: "Transparent scoring with confidence kept separate from fit.",
              },
              {
                icon: Sparkles,
                number: "04",
                title: "Open the conversation",
                text: "Financing scenario, seller questions, email, and call opener.",
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
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="outline" className="mb-5 border-primary/25 text-primary">
              No black-box magic
            </Badge>
            <h2 className="text-4xl font-semibold tracking-[-0.04em]">
              Qualified means explainable.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Buyable never claims to predict a sale. Every target separates
              observable evidence, bounded inference, and the questions a buyer
              still has to answer.
            </p>
            <Button asChild variant="outline" className="mt-8 rounded-full">
              <Link href="/campaigns/demo-lyon-services">
                Inspect the score
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "What we know",
                count: "6 evidence points",
                items: ["Operating history", "Service mix", "Contact path"],
              },
              {
                icon: Radar,
                title: "What we infer",
                count: "3 bounded signals",
                items: ["Owner-led identity", "Transition timing", "Revenue quality"],
              },
              {
                icon: CircleDot,
                title: "What to verify",
                count: "4 critical unknowns",
                items: ["Owner intent", "Concentration", "EBITDA quality"],
              },
            ].map((column) => (
              <Card key={column.title} className="bg-card/50">
                <CardContent className="p-5">
                  <column.icon className="mb-8 size-5 text-primary" />
                  <h3 className="text-sm font-medium">{column.title}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {column.count}
                  </p>
                  <div className="mt-6 space-y-3">
                    {column.items.map((item) => (
                      <p
                        key={item}
                        className="border-t border-border pt-3 text-xs text-muted-foreground"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center lg:px-8">
          <BrandMark compact />
          <p>Buyable — Team ELI · Built for the Ginse Hackathon</p>
          <p>Synthetic data · No outreach sent</p>
        </div>
      </footer>
    </main>
  );
}

