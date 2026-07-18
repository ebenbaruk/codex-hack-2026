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
  EvidenceSignal,
} from "@/lib/buyable/types";

export const businesses = pgTable(
  "businesses",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    sector: text("sector").notNull(),
    city: text("city").notNull(),
    department: text("department").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    foundedYear: integer("founded_year").notNull(),
    employeeEstimate: integer("employee_estimate").notNull(),
    revenueEstimateEur: integer("revenue_estimate_eur").notNull(),
    synthetic: boolean("synthetic").notNull().default(true),
    evidence: jsonb("evidence").$type<EvidenceSignal[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("businesses_sector_idx").on(table.sector),
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

