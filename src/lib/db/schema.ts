import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  AcquisitionInput,
  CampaignOutput,
  ContactPath,
  EvidenceSignal,
  FinancialYear,
  SyntheticBusiness,
  TransitionSignal,
} from "@/lib/buyable/types";

export const businesses = pgTable(
  "businesses",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    sector: text("sector").notNull(),
    region: text("region").notNull().default("Auvergne-Rhône-Alpes"),
    city: text("city").notNull(),
    department: text("department").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    foundedYear: integer("founded_year").notNull(),
    employeeEstimate: integer("employee_estimate").notNull(),
    revenueEstimateEur: integer("revenue_estimate_eur").notNull(),
    ebitdaMargin: real("ebitda_margin"),
    recurringRevenueRatio: real("recurring_revenue_ratio"),
    financialHistory: jsonb("financial_history").$type<FinancialYear[]>(),
    transitionSignals: jsonb("transition_signals").$type<TransitionSignal[]>(),
    contactPaths: jsonb("contact_paths").$type<ContactPath[]>(),
    profile: jsonb("profile").$type<SyntheticBusiness>(),
    synthetic: boolean("synthetic").notNull().default(true),
    evidence: jsonb("evidence").$type<EvidenceSignal[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("businesses_sector_idx").on(table.sector),
    index("businesses_region_idx").on(table.region),
    index("businesses_city_idx").on(table.city),
  ],
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: text("id").primaryKey(),
    input: jsonb("input").$type<AcquisitionInput>().notNull(),
    output: jsonb("output").$type<CampaignOutput>().notNull(),
    synthetic: boolean("synthetic").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("campaigns_created_at_idx").on(table.createdAt)],
);

export const ginseRuns = pgTable(
  "ginse_runs",
  {
    idempotencyKey: text("idempotency_key").primaryKey(),
    fingerprint: text("fingerprint").notNull(),
    operationId: text("operation_id").notNull(),
    status: text("status").notNull().default("processing"),
    input: jsonb("input").$type<AcquisitionInput>().notNull(),
    output: jsonb("output").$type<CampaignOutput>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("ginse_runs_operation_id_idx").on(table.operationId),
    index("ginse_runs_status_idx").on(table.status),
  ],
);
