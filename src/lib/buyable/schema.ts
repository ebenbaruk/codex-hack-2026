import { z } from "zod";
import {
  acquisitionSignals,
  regions,
  sectors,
} from "./types";

const employeeRangeSchema = z
  .object({
    min: z.number().int().min(1).max(500),
    max: z.number().int().min(2).max(1_000),
  })
  .strict()
  .refine((range) => range.min < range.max, {
    message: "Employee minimum must be lower than maximum",
  });

export const acquisitionInputSchema = z
  .object({
    region: z.enum(regions),
    sectors: z.array(z.enum(sectors)).min(1).max(10),
    cash_available_eur: z.number().int().min(50_000).max(10_000_000),
    revenue_range_eur: z
      .object({
        min: z.number().int().min(250_000).max(20_000_000),
        max: z.number().int().min(500_000).max(50_000_000),
      })
      .strict()
      .refine((range) => range.min < range.max, {
        message: "Revenue minimum must be lower than maximum",
      }),
    buyer_profile: z.string().min(12).max(500),
    target_city: z.string().min(2).max(80).optional(),
    employee_range: employeeRangeSchema.optional(),
    preferred_signals: z
      .array(z.enum(acquisitionSignals))
      .max(acquisitionSignals.length)
      .optional(),
    avoid_signals: z
      .array(
        z.enum([
          "project_heavy",
          "high_capex",
          "customer_concentration",
        ]),
      )
      .max(3)
      .optional(),
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
      "financial",
      "leadership",
    ]),
    label: z.string(),
    detail: z.string(),
    observed_at: z.string(),
    strength: z.enum(["strong", "medium", "weak"]),
    source: z.string(),
    classification: z.enum(["known", "inferred"]),
  })
  .strict();

const transitionSignalSchema = z
  .object({
    type: z.enum([
      "long_leadership_tenure",
      "no_visible_successor",
      "leadership_change",
      "public_transition_mention",
    ]),
    label: z.string(),
    detail: z.string(),
    observed_at: z.string(),
    strength: z.enum(["strong", "medium", "weak"]),
    source: z.string(),
  })
  .strict();

const financialYearSchema = z
  .object({
    year: z.union([z.literal(2023), z.literal(2024), z.literal(2025)]),
    revenue_eur: z.number().int(),
    ebitda_eur: z.number().int(),
    ebitda_margin: z.number(),
    free_cash_flow_eur: z.number().int(),
  })
  .strict();

const contactPathSchema = z
  .object({
    channel: z.enum([
      "business_email",
      "business_phone",
      "contact_form",
    ]),
    value: z.string(),
    role: z.string(),
    confidence: z.number().int().min(0).max(100),
    note: z.string(),
  })
  .strict();

const scoreBreakdownSchema = z
  .object({
    economic_quality: z.number().int().min(0).max(25),
    buyer_fit: z.number().int().min(0).max(20),
    financeability: z.number().int().min(0).max(20),
    operational_transferability: z.number().int().min(0).max(15),
    transition_signals: z.number().int().min(0).max(10),
    contactability: z.number().int().min(0).max(5),
    data_completeness: z.number().int().min(0).max(5),
  })
  .strict();

const targetSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    sector: z.enum(sectors),
    region: z.enum(regions).exclude(["France"]),
    city: z.string(),
    department: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    founded_year: z.number().int(),
    employee_estimate: z.number().int(),
    conviction_score: z.number().int().min(0).max(100),
    qualification_score: z.number().int().min(0).max(100),
    confidence: z.number().int().min(0).max(100),
    score_breakdown: scoreBreakdownSchema,
    estimated_financials: z
      .object({
        revenue_eur: z.number().int(),
        ebitda_eur: z.number().int(),
        ebitda_margin: z.number(),
        recurring_revenue_ratio: z.number(),
        customer_concentration_ratio: z.number(),
        maintenance_capex_ratio: z.number(),
        debt_eur: z.number().int(),
        three_year_revenue_cagr: z.number(),
        free_cash_flow_eur: z.number().int(),
        financial_history: z.array(financialYearSchema).length(3),
      })
      .strict(),
    valuation_range_eur: z
      .object({
        low: z.number().int(),
        high: z.number().int(),
        midpoint: z.number().int(),
        methodology: z.string(),
      })
      .strict(),
    financeability: z
      .object({
        required_equity_eur: z.number().int(),
        equity_gap_eur: z.number().int(),
        affordable_with_current_cash: z.boolean(),
        estimated_debt_capacity_eur: z.number().int(),
        base_dscr: z.number(),
      })
      .strict(),
    evidence: z.array(evidenceSchema).min(6),
    transition_signals: z.array(transitionSignalSchema),
    facts: z.array(z.string()).min(1),
    inferences: z.array(z.string()).min(1),
    unknowns: z.array(z.string()).min(1),
    why_buy: z.array(z.string()).min(1),
    why_not: z.array(z.string()).min(1),
    why_it_fits: z.array(z.string()).min(1),
    rank_explanation: z.string(),
    contact_paths: z.array(contactPathSchema).min(1),
    contact_path: contactPathSchema,
    next_action: z.string(),
    listed_for_sale: z.literal(false),
  })
  .strict();

const offerScenarioSchema = z
  .object({
    id: z.enum(["balanced", "seller_aligned", "cash_forward"]),
    label: z.string(),
    target_id: z.string(),
    enterprise_value_eur: z.number().int(),
    buyer_cash_eur: z.number().int(),
    senior_debt_eur: z.number().int(),
    seller_note_eur: z.number().int(),
    earnout_eur: z.number().int(),
    annual_debt_service_eur: z.number().int(),
    estimated_dscr: z.number(),
    seller_cash_at_close_eur: z.number().int(),
    rationale: z.string(),
    feasible: z.boolean(),
  })
  .strict();

const outreachPacketSchema = z
  .object({
    target_id: z.string(),
    email_subject: z.string(),
    email_body: z.string(),
    call_opener: z.string(),
    first_meeting_questions: z.array(z.string()).min(5),
    diligence_questions: z.array(z.string()).min(5),
  })
  .strict();

const topAcquisitionCaseSchema = z
  .object({
    target_id: z.string(),
    executive_summary: z.string(),
    investment_thesis: z.array(z.string()).min(3),
    why_now: z.array(z.string()).min(2),
    key_risks: z.array(z.string()).min(3),
    deal_breakers: z.array(z.string()).min(3),
    information_request: z
      .array(
        z
          .object({
            section: z.string(),
            documents: z.array(z.string()).min(2),
          })
          .strict(),
      )
      .min(3),
    lender_memo: z
      .object({
        request: z.string(),
        credit_case: z.array(z.string()).min(3),
        mitigants: z.array(z.string()).min(3),
      })
      .strict(),
    loi_draft: z.string(),
    hundred_day_plan: z
      .array(
        z
          .object({
            phase: z.string(),
            days: z.string(),
            priorities: z.array(z.string()).min(3),
          })
          .strict(),
      )
      .length(3),
  })
  .strict();

export const campaignOutputSchema = z
  .object({
    schema_version: z.literal("2"),
    campaign_id: z.string(),
    generated_at: z.string(),
    disclosure: z.literal("Synthetic hackathon demonstration data"),
    thesis_summary: z.string(),
    applied_filters: acquisitionInputSchema,
    market_funnel: z
      .object({
        universe_scanned: z.number().int().min(2_500),
        thesis_compatible: z.number().int().min(0),
        economically_solid: z.number().int().min(0),
        financeable: z.number().int().min(0),
        transition_relevant: z.number().int().min(0),
        conviction_list: z.literal(10),
      })
      .strict(),
    rejection_reasons: z.array(
      z
        .object({
          reason: z.string(),
          count: z.number().int().min(0),
          detail: z.string(),
        })
        .strict(),
    ),
    targets: z.array(targetSchema).length(10),
    conviction_targets: z.array(targetSchema).length(10),
    top_target_id: z.string(),
    ranking_explanation: z
      .object({
        headline: z.string(),
        why_number_one_wins: z.array(z.string()).min(3),
        methodology: z.string(),
        limitation: z.string(),
      })
      .strict(),
    top_acquisition_case: topAcquisitionCaseSchema,
    financing_snapshot: z
      .object({
        target_id: z.string(),
        midpoint_valuation_eur: z.number().int(),
        buyer_cash_eur: z.number().int(),
        senior_debt_eur: z.number().int(),
        seller_note_eur: z.number().int(),
        earnout_eur: z.number().int(),
        annual_debt_service_eur: z.number().int(),
        estimated_dscr: z.number(),
        equity_gap_eur: z.number().int(),
        assumption: z.string(),
        disclaimer: z.string(),
      })
      .strict(),
    offer_scenarios: z.array(offerScenarioSchema).length(3),
    outreach_packet: outreachPacketSchema,
    generated_artifacts: z
      .array(
        z
          .object({
            id: z.string(),
            type: z.enum([
              "investment_memo",
              "offer_scenarios",
              "seller_approach",
              "lender_memo",
              "loi_draft",
              "diligence_checklist",
              "hundred_day_plan",
            ]),
            title: z.string(),
            status: z.literal("draft"),
            review_required: z.boolean(),
          })
          .strict(),
      )
      .length(7),
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
    region: { type: "string", enum: regions },
    sectors: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: { type: "string", enum: sectors },
    },
    cash_available_eur: {
      type: "integer",
      minimum: 50_000,
      maximum: 10_000_000,
    },
    revenue_range_eur: {
      type: "object",
      additionalProperties: false,
      required: ["min", "max"],
      properties: {
        min: { type: "integer", minimum: 250_000, maximum: 20_000_000 },
        max: { type: "integer", minimum: 500_000, maximum: 50_000_000 },
      },
    },
    buyer_profile: { type: "string", minLength: 12, maxLength: 500 },
    target_city: { type: "string", minLength: 2, maxLength: 80 },
    employee_range: {
      type: "object",
      additionalProperties: false,
      required: ["min", "max"],
      properties: {
        min: { type: "integer", minimum: 1, maximum: 500 },
        max: { type: "integer", minimum: 2, maximum: 1_000 },
      },
    },
    preferred_signals: {
      type: "array",
      maxItems: acquisitionSignals.length,
      items: { type: "string", enum: acquisitionSignals },
    },
    avoid_signals: {
      type: "array",
      maxItems: 3,
      items: {
        type: "string",
        enum: [
          "project_heavy",
          "high_capex",
          "customer_concentration",
        ],
      },
    },
  },
} as const;
