import { neon } from "@neondatabase/serverless";
import { syntheticBusinesses } from "../src/lib/buyable/data";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);
const BATCH_SIZE = 50;

async function seed() {
  for (let offset = 0; offset < syntheticBusinesses.length; offset += BATCH_SIZE) {
    const batch = syntheticBusinesses
      .slice(offset, offset + BATCH_SIZE)
      .map((business) => ({
        id: business.id,
        name: business.name,
        sector: business.sector,
        region: business.region,
        city: business.city,
        department: business.department,
        latitude: business.latitude,
        longitude: business.longitude,
        founded_year: business.founded_year,
        employee_estimate: business.employee_estimate,
        revenue_estimate_eur: business.revenue_estimate_eur,
        ebitda_margin: business.ebitda_margin,
        recurring_revenue_ratio: business.recurring_revenue_ratio,
        financial_history: business.financial_history,
        transition_signals: business.transition_signals,
        contact_paths: business.contact_paths,
        evidence: business.evidence,
        profile: business,
      }));

    await sql`
      INSERT INTO businesses (
        id,
        name,
        sector,
        region,
        city,
        department,
        latitude,
        longitude,
        founded_year,
        employee_estimate,
        revenue_estimate_eur,
        ebitda_margin,
        recurring_revenue_ratio,
        financial_history,
        transition_signals,
        contact_paths,
        evidence,
        profile,
        synthetic,
        updated_at
      )
      SELECT
        row.id,
        row.name,
        row.sector,
        row.region,
        row.city,
        row.department,
        row.latitude,
        row.longitude,
        row.founded_year,
        row.employee_estimate,
        row.revenue_estimate_eur,
        row.ebitda_margin,
        row.recurring_revenue_ratio,
        row.financial_history,
        row.transition_signals,
        row.contact_paths,
        row.evidence,
        row.profile,
        TRUE,
        NOW()
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS row(
        id TEXT,
        name TEXT,
        sector TEXT,
        region TEXT,
        city TEXT,
        department TEXT,
        latitude REAL,
        longitude REAL,
        founded_year INTEGER,
        employee_estimate INTEGER,
        revenue_estimate_eur INTEGER,
        ebitda_margin REAL,
        recurring_revenue_ratio REAL,
        financial_history JSONB,
        transition_signals JSONB,
        contact_paths JSONB,
        evidence JSONB,
        profile JSONB
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        sector = EXCLUDED.sector,
        region = EXCLUDED.region,
        city = EXCLUDED.city,
        department = EXCLUDED.department,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        employee_estimate = EXCLUDED.employee_estimate,
        revenue_estimate_eur = EXCLUDED.revenue_estimate_eur,
        ebitda_margin = EXCLUDED.ebitda_margin,
        recurring_revenue_ratio = EXCLUDED.recurring_revenue_ratio,
        financial_history = EXCLUDED.financial_history,
        transition_signals = EXCLUDED.transition_signals,
        contact_paths = EXCLUDED.contact_paths,
        evidence = EXCLUDED.evidence,
        profile = EXCLUDED.profile,
        updated_at = NOW()
    `;

    console.log(
      `Seeded ${Math.min(offset + BATCH_SIZE, syntheticBusinesses.length)} / ${syntheticBusinesses.length}`,
    );
  }

  await sql`
    DELETE FROM businesses
    WHERE synthetic = TRUE
      AND id LIKE 'syn-%'
      AND id NOT LIKE 'syn-fr-%'
  `;

  console.log(`Seeded ${syntheticBusinesses.length} synthetic businesses.`);
}

seed().catch((error) => {
  console.error("Database seed failed", error);
  process.exitCode = 1;
});
