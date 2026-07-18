import { neon } from "@neondatabase/serverless";
import { syntheticBusinesses } from "../src/lib/buyable/data";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);

for (const business of syntheticBusinesses) {
  await sql`
    INSERT INTO businesses (
      id,
      name,
      sector,
      city,
      department,
      latitude,
      longitude,
      founded_year,
      employee_estimate,
      revenue_estimate_eur,
      synthetic,
      evidence
    )
    VALUES (
      ${business.id},
      ${business.name},
      ${business.sector},
      ${business.city},
      ${business.department},
      ${business.latitude},
      ${business.longitude},
      ${business.founded_year},
      ${business.employee_estimate},
      ${business.revenue_estimate_eur},
      true,
      ${JSON.stringify(business.evidence)}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      revenue_estimate_eur = EXCLUDED.revenue_estimate_eur,
      evidence = EXCLUDED.evidence
  `;
}

console.log(`Seeded ${syntheticBusinesses.length} synthetic businesses.`);

