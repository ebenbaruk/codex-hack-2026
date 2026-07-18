import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  Check,
  Database,
  FileCheck2,
  Radar,
  Search,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { demoCampaign } from "@/lib/buyable/engine";
import { sectorLabels } from "@/lib/buyable/data";

const previewTargets = demoCampaign.targets.slice(0, 3);
const funnel = demoCampaign.market_funnel;

const process = [
  {
    icon: Database,
    number: "01",
    title: "Scan the private market",
    text: "Search thousands of businesses, including companies that are not listed for sale.",
  },
  {
    icon: Radar,
    number: "02",
    title: "Build the evidence",
    text: "Structure financial, operating, transition and contact signals for every candidate.",
  },
  {
    icon: Target,
    number: "03",
    title: "Defend the ranking",
    text: "Explain every elimination and why the first target beats the alternatives.",
  },
  {
    icon: FileCheck2,
    number: "04",
    title: "Prepare the acquisition",
    text: "Generate financing scenarios, outreach, a lender memo, LOI and diligence plan.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-foreground">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 lg:px-8">
          <BrandMark />
          <div className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
            <a href="#use-with-codex" className="hover:text-foreground">
              Use with Codex
            </a>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
            <a href="#conviction" className="hover:text-foreground">
              Conviction engine
            </a>
            <span className="text-primary">Ginse Hackathon</span>
          </div>
          <Button asChild size="sm">
            <Link href="/campaigns/demo-lyon-services">
              Open demo
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-[1440px] border-x border-border lg:grid-cols-[1.08fr_.92fr]">
        <div className="flex min-h-[680px] flex-col justify-between border-b border-border p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
          <div>
            <p className="mb-9 text-[11px] uppercase tracking-[0.18em] text-primary">
              Acquisition intelligence for Codex
            </p>
            <h1 className="font-display max-w-4xl text-[3.6rem] leading-[0.9] tracking-[-0.035em] sm:text-[5rem] lg:text-[6.2rem]">
              Know which business{" "}
              <em className="font-normal text-primary">is worth buying.</em>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground">
              Buyable gives Codex the private-market data, evidence and financial
              tools required to find, compare and prepare the acquisition of a
              business.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-5">
                <Link href="/campaigns/demo-lyon-services">
                  Explore the killer demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <div className="flex h-11 items-center border border-border px-4 text-xs text-muted-foreground">
                €0.99 · Hackathon test balance
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-px border border-border bg-border sm:grid-cols-3">
            {[
              "2,500 businesses scanned",
              "Every rank explained",
              "Deal Pack generated",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-background px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <Check className="size-3 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-[680px] items-center bg-card p-4 sm:p-8 lg:p-10">
          <div className="w-full border border-foreground bg-background">
            <div className="flex h-9 items-center justify-between border-b border-foreground px-3">
              <div className="flex items-center gap-1.5">
                <span className="size-3 border border-foreground bg-primary" />
                <span className="size-3 border border-foreground" />
                <span className="size-3 border border-foreground" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Codex → Ginse → Buyable
              </span>
            </div>

            <div className="border-b border-border p-5 text-sm leading-6">
              <span className="mr-2 text-primary">›</span>
              Find the best HVAC and plumbing businesses around Lyon that I
              could acquire with €250,000.
            </div>

            <div className="grid grid-cols-5 border-b border-border">
              {[
                [funnel.universe_scanned, "scanned"],
                [funnel.thesis_compatible, "thesis"],
                [funnel.economically_solid, "quality"],
                [funnel.financeable, "finance"],
                [funnel.conviction_list, "top"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-r border-border px-1 py-3 text-center last:border-r-0"
                >
                  <p className="number-tabular text-sm text-primary">{value}</p>
                  <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>Acquisition conviction list</span>
              <span>10 ranked · under 3 sec</span>
            </div>

            <div>
              {previewTargets.map((target, index) => (
                <div
                  key={target.id}
                  className="grid grid-cols-[34px_1fr_auto] items-center gap-3 border-b border-border p-4 last:border-b-0"
                >
                  <span
                    className={
                      index === 0
                        ? "flex size-8 items-center justify-center border border-primary bg-primary text-xs text-primary-foreground"
                        : "flex size-8 items-center justify-center border border-border text-xs text-muted-foreground"
                    }
                  >
                    0{index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">{target.name}</p>
                      {index === 0 ? (
                        <Badge variant="outline">Why #1</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {target.city} · {sectorLabels[target.sector]} ·{" "}
                      {(
                        target.estimated_financials.revenue_eur / 1_000_000
                      ).toFixed(1)}
                      M€
                    </p>
                  </div>
                  <div className="border-l border-border pl-4 text-right">
                    <p className="number-tabular text-xl text-primary">
                      {target.conviction_score}
                    </p>
                    <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      score
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-foreground px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              <span>Synthetic hackathon demonstration data</span>
              <span className="text-primary">Open analysis ↗</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="use-with-codex"
        className="mx-auto max-w-[1440px] border-x border-t border-border"
      >
        <div className="grid border-b border-border lg:grid-cols-[.72fr_1.28fr]">
          <div className="border-b border-border p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
              Native to the conversation
            </p>
            <h2 className="font-display mt-5 text-5xl leading-none sm:text-6xl">
              The answer appears in Codex.
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground">
              The dashboard is the proof layer—not the only result. Buyable
              gives Codex a complete recommendation, the decisive evidence,
              financing logic, next actions and prompts to continue the
              acquisition work.
            </p>
          </div>

          <div className="bg-card p-4 sm:p-8 lg:p-10">
            <div className="border border-foreground bg-background">
              <div className="flex items-center justify-between border-b border-foreground px-4 py-3">
                <span className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Recommended prompt
                </span>
                <span className="size-3 border border-foreground bg-primary" />
              </div>
              <p className="p-5 text-sm leading-7 sm:p-7 sm:text-base">
                “Use Ginse app app.ginse.ai/elibenbaruk-cd9272/buyable to find
                the best recurring-revenue HVAC and plumbing businesses around
                Lyon that I could acquire with €250,000. Rank the top 10,
                explain why #1 wins, stress-test the financing and tell me what
                I should verify first.”
              </p>
              <div className="grid border-t border-border sm:grid-cols-3">
                {[
                  [
                    "01 · Ask",
                    "Describe your budget, geography, sectors and buyer profile in Codex.",
                  ],
                  [
                    "02 · Analyze",
                    "Ginse invokes Buyable to scan, score, compare and package the targets.",
                  ],
                  [
                    "03 · Continue",
                    "Read the answer in Codex, ask follow-ups or open the evidence dashboard.",
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                  >
                    <p className="text-[9px] uppercase tracking-[0.14em] text-primary">
                      {title}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-between gap-4 border-t border-foreground p-4 sm:flex-row sm:items-center">
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  Answer in Codex · Evidence in dashboard · €0.99
                </p>
                <Button asChild size="sm">
                  <a
                    href="https://app.ginse.ai/elibenbaruk-cd9272/buyable"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Buyable on Ginse
                    <ArrowRight className="size-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-[1440px] border-x border-t border-border bg-background"
      >
        <div className="grid border-b border-border lg:grid-cols-[.75fr_1.25fr]">
          <div className="border-b border-border p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
              One request
            </p>
            <h2 className="font-display mt-5 text-5xl leading-none sm:text-6xl">
              The work of an acquisition team.
            </h2>
          </div>
          <div className="flex items-end p-6 sm:p-10 lg:p-14">
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Codex remains the intelligence. Buyable supplies the structured
              market universe, evidence, calculations and durable deal
              artifacts that Codex cannot create alone.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4">
          {process.map((step, index) => (
            <article
              key={step.number}
              className="min-h-72 border-b border-border p-6 md:border-r md:p-8 xl:border-b-0 xl:last:border-r-0"
            >
              <div className="flex items-center justify-between">
                <step.icon className="size-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-20 text-lg">{step.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {step.text}
              </p>
              {index < process.length - 1 ? (
                <ArrowRight className="mt-8 size-4 text-border" />
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        id="conviction"
        className="mx-auto grid max-w-[1440px] border border-border lg:grid-cols-2"
      >
        <div className="border-b border-border p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
          <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
            Conviction, not leads
          </p>
          <h2 className="font-display mt-5 max-w-xl text-5xl leading-none sm:text-6xl">
            “Best” has to be defensible.
          </h2>
          <p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground">
            Buyable separates company quality, buyer fit, financeability,
            transferability and observable transition evidence. Confidence,
            facts, inferences and unknowns remain separate.
          </p>
          <Button asChild variant="outline" className="mt-9">
            <Link href="/campaigns/demo-lyon-services">
              Inspect why #1 wins
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2">
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
              text: "Change buyer cash and watch rankings and offer structures move.",
            },
            {
              icon: FileCheck2,
              title: "Acquisition Deal Pack",
              text: "Investment memo, seller approach, financing, LOI and 100-day plan.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="min-h-56 border-b border-border p-6 odd:border-r sm:p-8"
            >
              <item.icon className="size-4 text-primary" />
              <h3 className="mt-14 text-base">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 border-x border-b border-border px-5 py-7 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center lg:px-8">
        <BrandMark compact />
        <p>Buyable · Acquisition intelligence for Codex</p>
        <p>Synthetic data · Drafts only · No outreach sent</p>
      </footer>
    </main>
  );
}
