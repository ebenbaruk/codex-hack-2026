export const DISCLOSURE = "Synthetic hackathon demonstration data" as const;

export const regions = [
  "France",
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d’Azur",
] as const;

export type RegionScope = (typeof regions)[number];
export type BusinessRegion = Exclude<RegionScope, "France">;

export const sectors = [
  "hvac",
  "plumbing",
  "commercial_cleaning",
  "industrial_maintenance",
  "electrical_contracting",
  "fire_safety",
  "elevator_maintenance",
  "landscaping",
  "waste_management",
  "business_security",
] as const;

export type Sector = (typeof sectors)[number];

export const acquisitionSignals = [
  "recurring_revenue",
  "management_depth",
  "low_capex",
  "diversified_customers",
  "visible_transition_signal",
] as const;

export type AcquisitionSignal = (typeof acquisitionSignals)[number];

export type AcquisitionInput = {
  region: RegionScope;
  sectors: Sector[];
  cash_available_eur: number;
  revenue_range_eur: {
    min: number;
    max: number;
  };
  buyer_profile: string;
  target_city?: string;
  employee_range?: {
    min: number;
    max: number;
  };
  preferred_signals?: AcquisitionSignal[];
  avoid_signals?: Array<"project_heavy" | "high_capex" | "customer_concentration">;
};

export type EvidenceType =
  | "registry"
  | "website"
  | "reviews"
  | "hiring"
  | "operations"
  | "commercial"
  | "financial"
  | "leadership";

export type EvidenceSignal = {
  id: string;
  type: EvidenceType;
  label: string;
  detail: string;
  observed_at: string;
  strength: "strong" | "medium" | "weak";
  source: string;
  classification: "known" | "inferred";
};

export type TransitionSignal = {
  type:
    | "long_leadership_tenure"
    | "no_visible_successor"
    | "leadership_change"
    | "public_transition_mention";
  label: string;
  detail: string;
  observed_at: string;
  strength: "strong" | "medium" | "weak";
  source: string;
};

export type FinancialYear = {
  year: 2023 | 2024 | 2025;
  revenue_eur: number;
  ebitda_eur: number;
  ebitda_margin: number;
  free_cash_flow_eur: number;
};

export type ContactPath = {
  channel: "business_email" | "business_phone" | "contact_form";
  value: string;
  role: string;
  confidence: number;
  note: string;
};

export type SyntheticBusiness = {
  id: string;
  name: string;
  sector: Sector;
  region: BusinessRegion;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  founded_year: number;
  employee_estimate: number;
  revenue_estimate_eur: number;
  ebitda_margin: number;
  recurring_revenue_ratio: number;
  customer_concentration_ratio: number;
  maintenance_capex_ratio: number;
  debt_eur: number;
  review_rating: number;
  review_count: number;
  website_freshness_years: number;
  digital_maturity: number;
  management_visibility: number;
  owner_contact_prominence: number;
  leadership_tenure_years: number;
  leadership_changes_3y: number;
  successor_visible: boolean;
  public_transition_mention: boolean;
  hiring_signal: boolean;
  contactability: number;
  financial_history: FinancialYear[];
  transition_signals: TransitionSignal[];
  contact_paths: ContactPath[];
  evidence: EvidenceSignal[];
};

export type ScoreBreakdown = {
  economic_quality: number;
  buyer_fit: number;
  financeability: number;
  operational_transferability: number;
  transition_signals: number;
  contactability: number;
  data_completeness: number;
};

export type QualifiedTarget = {
  id: string;
  name: string;
  sector: Sector;
  region: BusinessRegion;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  founded_year: number;
  employee_estimate: number;
  conviction_score: number;
  qualification_score: number;
  confidence: number;
  score_breakdown: ScoreBreakdown;
  estimated_financials: {
    revenue_eur: number;
    ebitda_eur: number;
    ebitda_margin: number;
    recurring_revenue_ratio: number;
    customer_concentration_ratio: number;
    maintenance_capex_ratio: number;
    debt_eur: number;
    three_year_revenue_cagr: number;
    free_cash_flow_eur: number;
    financial_history: FinancialYear[];
  };
  valuation_range_eur: {
    low: number;
    high: number;
    midpoint: number;
    methodology: string;
  };
  financeability: {
    required_equity_eur: number;
    equity_gap_eur: number;
    affordable_with_current_cash: boolean;
    estimated_debt_capacity_eur: number;
    base_dscr: number;
  };
  evidence: EvidenceSignal[];
  transition_signals: TransitionSignal[];
  facts: string[];
  inferences: string[];
  unknowns: string[];
  why_buy: string[];
  why_not: string[];
  why_it_fits: string[];
  rank_explanation: string;
  contact_paths: ContactPath[];
  contact_path: ContactPath;
  next_action: string;
  listed_for_sale: false;
};

export type MarketFunnel = {
  universe_scanned: number;
  thesis_compatible: number;
  economically_solid: number;
  financeable: number;
  transition_relevant: number;
  conviction_list: number;
};

export type RejectionReason = {
  reason: string;
  count: number;
  detail: string;
};

export type OfferScenario = {
  id: "balanced" | "seller_aligned" | "cash_forward";
  label: string;
  target_id: string;
  enterprise_value_eur: number;
  buyer_cash_eur: number;
  senior_debt_eur: number;
  seller_note_eur: number;
  earnout_eur: number;
  annual_debt_service_eur: number;
  estimated_dscr: number;
  seller_cash_at_close_eur: number;
  rationale: string;
  feasible: boolean;
};

export type FinancingSnapshot = {
  target_id: string;
  midpoint_valuation_eur: number;
  buyer_cash_eur: number;
  senior_debt_eur: number;
  seller_note_eur: number;
  earnout_eur: number;
  annual_debt_service_eur: number;
  estimated_dscr: number;
  equity_gap_eur: number;
  assumption: string;
  disclaimer: string;
};

export type OutreachPacket = {
  target_id: string;
  email_subject: string;
  email_body: string;
  call_opener: string;
  first_meeting_questions: string[];
  diligence_questions: string[];
};

export type TopAcquisitionCase = {
  target_id: string;
  executive_summary: string;
  investment_thesis: string[];
  why_now: string[];
  key_risks: string[];
  deal_breakers: string[];
  information_request: Array<{
    section: string;
    documents: string[];
  }>;
  lender_memo: {
    request: string;
    credit_case: string[];
    mitigants: string[];
  };
  loi_draft: string;
  hundred_day_plan: Array<{
    phase: string;
    days: string;
    priorities: string[];
  }>;
};

export type GeneratedArtifact = {
  id: string;
  type:
    | "investment_memo"
    | "offer_scenarios"
    | "seller_approach"
    | "lender_memo"
    | "loi_draft"
    | "diligence_checklist"
    | "hundred_day_plan";
  title: string;
  status: "draft";
  review_required: boolean;
};

export type CodexResponse = {
  executive_summary: string;
  answer_markdown: string;
  top_targets: Array<{
    rank: number;
    id: string;
    name: string;
    city: string;
    sector: string;
    conviction_score: number;
    confidence: number;
    revenue_eur: number;
    ebitda_eur: number;
    valuation_midpoint_eur: number;
    estimated_dscr: number;
    why_it_ranks: string;
  }>;
  financing_summary: {
    target_name: string;
    valuation_midpoint_eur: number;
    buyer_cash_eur: number;
    senior_debt_eur: number;
    seller_note_eur: number;
    earnout_eur: number;
    estimated_dscr: number;
    equity_gap_eur: number;
  };
  critical_unknowns: string[];
  key_takeaways: string[];
  recommended_next_actions: string[];
  suggested_follow_up_prompts: string[];
};

export type DashboardDeliverable = {
  url: string;
  title: string;
  status: "ready";
  contains: string[];
  call_to_action: string;
};

export type CampaignOutput = {
  schema_version: "2";
  dashboard: DashboardDeliverable;
  campaign_url: string;
  codex_response: CodexResponse;
  campaign_id: string;
  generated_at: string;
  disclosure: typeof DISCLOSURE;
  thesis_summary: string;
  applied_filters: AcquisitionInput;
  market_funnel: MarketFunnel;
  rejection_reasons: RejectionReason[];
  targets: QualifiedTarget[];
  top_target_id: string;
  ranking_explanation: {
    headline: string;
    why_number_one_wins: string[];
    methodology: string;
    limitation: string;
  };
  top_acquisition_case: TopAcquisitionCase;
  financing_snapshot: FinancingSnapshot;
  offer_scenarios: OfferScenario[];
  outreach_packet: OutreachPacket;
  generated_artifacts: GeneratedArtifact[];
};
