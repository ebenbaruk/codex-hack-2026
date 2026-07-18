# Buyable — Team ELI

Buyable turns one acquisition thesis into ten qualified, off-market French
business targets for Codex. It returns evidence, a transparent score,
confidence, explicit unknowns, valuation assumptions, an illustrative financing
snapshot, and a prepared outreach packet for the strongest target.

> **Synthetic hackathon demonstration data.** Every company, contact path,
> financial estimate, and evidence record in this repository is synthetic. No
> outreach is sent.

## Killer demo

Ask Codex:

> Use Buyable to find HVAC and plumbing businesses around Lyon that I could
> acquire with €250,000 of cash.

Buyable scans a deterministic 40-company synthetic universe and returns a
ranked target pipeline plus a shareable campaign dashboard. The live judge demo
is available at `/campaigns/demo-lyon-services`.

## Why this is Codex-first

The primary product is one strict Ginse action:

```text
Acquisition thesis → Qualify off-market targets → Qualified target pipeline
```

Codex can inspect the JSON Schema, collect only the required thesis fields,
invoke Buyable for €0.99 of hackathon test balance, and reason over the
structured result. The dashboard is the polished human-readable artifact Codex
can share.

## Qualification model

Qualification and confidence are intentionally separate:

| Contribution | Maximum |
| --- | ---: |
| Acquisition-thesis fit | 30 |
| Economic attractiveness | 20 |
| Evidence quality | 20 |
| Succession signals | 15 |
| Contactability | 10 |
| Data completeness | 5 |

Every result separates what is known, what is inferred, and what must be
verified. Buyable never infers owner age or claims that a sale is predictable.

## Architecture

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- shadcn/Radix components and locally packaged Geist fonts
- Neon Postgres with Drizzle schema
- Ed25519 Ginse invocation verification through the official JWKS
- Atomic `Idempotency-Key` claim bound to a canonical SHA-256 input fingerprint
- Vitest for qualification/idempotency tests and Playwright for desktop/mobile
  judge flows

Key surfaces:

- `POST /run` — authenticated synchronous Ginse action
- `GET /status/:operationId` — authenticated status response
- `/.well-known/ginse.json` — generated marketplace manifest
- `/campaigns/:id` — public opaque shareable campaign

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without `DATABASE_URL`, local development uses an in-memory run store. Production
must use Neon so idempotency and campaign URLs survive restarts and replicas.

Database setup:

```bash
npm run db:migrate
npm run db:seed
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Regenerate the checked-in Ginse contracts after changing either Zod schema:

```bash
npm run ginse:contract
```

## Safety boundaries

- Synthetic records only; `.example.invalid` contact paths cannot reach anyone.
- Outreach is prepared, copied, and reviewed, never sent.
- Financing is labelled illustrative and is not investment or lending advice.
- Missing, expired, or invalid Ginse bearer tokens are rejected.
- A reused idempotency key with changed input is rejected.
- No payment code or builder secret exists here; Ginse controls the test ledger.

See [docs/DEMO.md](docs/DEMO.md) for the three-minute presentation.
