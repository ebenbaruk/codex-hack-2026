import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    city TEXT NOT NULL,
    department TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    founded_year INTEGER NOT NULL,
    employee_estimate INTEGER NOT NULL,
    revenue_estimate_eur INTEGER NOT NULL,
    synthetic BOOLEAN NOT NULL DEFAULT TRUE,
    evidence JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS businesses_sector_idx ON businesses (sector)
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

