# Buyable

Buyable is the acquisition-intelligence layer for Codex. One buyer thesis scans
a deterministic universe of 2,500 synthetic French businesses, explains the
market funnel, returns ten acquisition-conviction targets, and prepares a
complete Deal Pack for the strongest opportunity.

> **Synthetic hackathon demonstration data.** Every company, contact path,
> financial statement and evidence record is synthetic. Buyable does not infer
> owner age, predict a sale, send outreach, or provide legal or financial advice.

## Killer demo

Ask Codex:

> Use Ginse app app.ginse.ai/elibenbaruk-cd9272/buyable to find the best HVAC
> and plumbing businesses around Lyon that I could acquire with €250,000 of
> cash.

Buyable returns:

- a complete recommendation directly inside the Codex conversation;
- a `2,500 → thesis → quality → financeability → transition → top 10` funnel;
- a transparent 100-point Acquisition Conviction Score;
- facts, bounded inferences, evidence confidence and unknowns;
- an explanation of why #1 beats #2;
- three offer structures and live buyer-cash simulation;
- an investment memo, seller approach, lender memo, LOI draft, diligence list
  and first-100-days plan.
- a dashboard URL plus three contextual prompts so Codex can continue the work.

The deterministic judge demo is available at
`/campaigns/demo-lyon-services`.

## Why Codex needs it

Codex remains the reasoning layer. Buyable contributes the private-business
universe, structured evidence, comparable calculations, transaction workflow
and durable artifacts that Codex can call and reason over. Every invocation
returns both a `codex_response` for the conversation and a `campaign_url` for
the evidence-rich dashboard.

```text
Acquisition search → Curate acquisition targets → Acquisition conviction list
```

## Conviction model

| Contribution | Maximum |
| --- | ---: |
| Economic quality | 25 |
| Buyer fit | 20 |
| Financeability | 20 |
| Operational transferability | 15 |
| Observable transition signals | 10 |
| Contactability | 5 |
| Data completeness | 5 |

Evidence confidence is calculated and displayed separately from conviction.
“Best” means highest-ranked inside the disclosed synthetic universe and buyer
criteria, never a certainty about owner intent.

## Architecture

- Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4
- shadcn/Radix components and locally packaged Geist fonts
- Neon Postgres with enriched synthetic profiles and durable Ginse runs
- Ed25519 Ginse invocation verification through the official JWKS
- Atomic `Idempotency-Key` claim bound to a canonical SHA-256 fingerprint
- Vitest, JSON Schema validation and Playwright judge-flow coverage

Public surfaces:

- `POST /run` — authenticated Ginse action
- `GET /status/:operationId` — authenticated operation status
- `/.well-known/ginse.json` — marketplace manifest
- `/campaigns/:id` — shareable acquisition analysis

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without `DATABASE_URL`, local development uses an in-memory run store.
Production requires Neon for durable idempotency and campaign URLs.

```bash
npm run db:migrate
npm run db:seed
npm run ginse:contract
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

See [docs/DEMO.md](docs/DEMO.md) for the three-minute presentation.
