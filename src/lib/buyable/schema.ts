import { z } from "zod";
import { sectors } from "./types";

export const acquisitionInputSchema = z
  .object({
    region: z.literal("Auvergne-Rhône-Alpes"),
    sectors: z.array(z.enum(sectors)).min(1).max(4),
    cash_available_eur: z.number().int().min(50_000).max(2_000_000),
    revenue_range_eur: z
      .object({
        min: z.number().int().min(250_000).max(10_000_000),
        max: z.number().int().min(500_000).max(20_000_000),
      })
      .refine((range) => range.min < range.max, {
        message: "Revenue minimum must be lower than maximum",
      }),
    buyer_profile: z.string().min(12).max(300),
  })
  .strict();

const evidenceSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      "registry",
      "website",
      "reviews",
      "hiring",
      "operations",
      "commercial",
    ]),
    label: z.string(),
    detail: z.string(),
    observed_at: z.string(),
    strength: z.enum(["strong", "medium", "weak"]),
    source: z.string(),
  })
  .strict();

const targetSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    sector: z.enum(sectors),
    city: z.string(),
    department: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    founded_year: z.number().int(),
    employee_estimate: z.number().int(),
    qualification_score: z.number().int().min(0).max(100),
    confidence: z.number().int().min(0).max(100),
    score_breakdown: z
      .object({
        thesis_fit: z.number(),
        economic_attractiveness: z.number(),
        evidence_quality: z.number(),
        succession_signals: z.number(),
        contactability: z.number(),
        data_completeness: z.number(),
      })
      .strict(),
    estimated_financials: z
      .object({
        revenue_eur: z.number().int(),
        ebitda_eur: z.number().int(),
        ebitda_margin: z.number(),
        recurring_revenue_ratio: z.number(),
      })
      .strict(),
    valuation_range_eur: z
      .object({
        low: z.number().int(),
        high: z.number().int(),
        methodology: z.string(),
      })
      .strict(),
    evidence: z.array(evidenceSchema),
    inferences: z.array(z.string()),
    unknowns: z.array(z.string()),
    why_it_fits: z.array(z.string()),
    contact_path: z
      .object({
        channel: z.enum(["business_email", "business_phone", "contact_form"]),
        value: z.string(),
        note: z.string(),
      })
      .strict(),
    next_action: z.string(),
    listed_for_sale: z.literal(false),
  })
  .strict();

export const campaignOutputSchema = z
  .object({
    campaign_id: z.string(),
    generated_at: z.string(),
    disclosure: z.literal("Synthetic hackathon demonstration data"),
    thesis_summary: z.string(),
    targets: z.array(targetSchema).length(10),
    top_target_id: z.string(),
    financing_snapshot: z
      .object({
        target_id: z.string(),
        midpoint_valuation_eur: z.number().int(),
        buyer_cash_eur: z.number().int(),
        senior_debt_eur: z.number().int(),
        seller_note_eur: z.number().int(),
        annual_debt_service_eur: z.number().int(),
        estimated_dscr: z.number(),
        assumption: z.string(),
        disclaimer: z.string(),
      })
      .strict(),
    outreach_packet: z
      .object({
        target_id: z.string(),
        email_subject: z.string(),
        email_body: z.string(),
        call_opener: z.string(),
        diligence_questions: z.array(z.string()).min(5),
      })
      .strict(),
    campaign_url: z.string().url(),
  })
  .strict();

export const inputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "region",
    "sectors",
    "cash_available_eur",
    "revenue_range_eur",
    "buyer_profile",
  ],
  properties: {
    region: { type: "string", const: "Auvergne-Rhône-Alpes" },
    sectors: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string", enum: sectors },
    },
    cash_available_eur: {
      type: "integer",
      minimum: 50000,
      maximum: 2000000,
    },
    revenue_range_eur: {
      type: "object",
      additionalProperties: false,
      required: ["min", "max"],
      properties: {
        min: { type: "integer", minimum: 250000, maximum: 10000000 },
        max: { type: "integer", minimum: 500000, maximum: 20000000 },
      },
    },
    buyer_profile: { type: "string", minLength: 12, maxLength: 300 },
  },
} as const;

