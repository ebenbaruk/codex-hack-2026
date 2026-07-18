import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql`
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'Auvergne-Rhône-Alpes',
    city TEXT NOT NULL,
    department TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    founded_year INTEGER NOT NULL,
    employee_estimate INTEGER NOT NULL,
    revenue_estimate_eur INTEGER NOT NULL,
    ebitda_margin REAL,
    recurring_revenue_ratio REAL,
    financial_history JSONB,
    transition_signals JSONB,
    contact_paths JSONB,
    profile JSONB,
    synthetic BOOLEAN NOT NULL DEFAULT TRUE,
    evidence JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
  `;

  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'Auvergne-Rhône-Alpes'`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ebitda_margin REAL`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS recurring_revenue_ratio REAL`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS financial_history JSONB`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS transition_signals JSONB`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS contact_paths JSONB`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS profile JSONB`;
  await sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;

  await sql`
  CREATE INDEX IF NOT EXISTS businesses_sector_idx ON businesses (sector)
  `;

  await sql`
  CREATE INDEX IF NOT EXISTS businesses_region_idx ON businesses (region)
  `;

  await sql`
  CREATE INDEX IF NOT EXISTS businesses_city_idx ON businesses (city)
  `;

  await sql`
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    input JSONB NOT NULL,
    output JSONB NOT NULL,
    synthetic BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
  `;

  await sql`
  CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON campaigns (created_at)
  `;

  await sql`
  CREATE TABLE IF NOT EXISTS ginse_runs (
    idempotency_key TEXT PRIMARY KEY,
    fingerprint TEXT NOT NULL,
    operation_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'processing',
    input JSONB NOT NULL,
    output JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
  )
  `;

  await sql`
  CREATE INDEX IF NOT EXISTS ginse_runs_status_idx ON ginse_runs (status)
  `;

  console.log("Buyable database schema is ready.");
}

migrate().catch((error) => {
  console.error("Database migration failed", error);
  process.exitCode = 1;
});
