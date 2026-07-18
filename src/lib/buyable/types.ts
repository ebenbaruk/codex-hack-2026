export const DISCLOSURE = "Synthetic hackathon demonstration data" as const;

export const sectors = [
  "hvac",
  "plumbing",
  "commercial_cleaning",
  "industrial_maintenance",
] as const;

export type Sector = (typeof sectors)[number];

export type AcquisitionInput = {
  region: "Auvergne-Rhône-Alpes";
  sectors: Sector[];
  cash_available_eur: number;
  revenue_range_eur: {
    min: number;
    max: number;
  };
  buyer_profile: string;
};

export type EvidenceType =
  | "registry"
  | "website"
  | "reviews"
  | "hiring"
  | "operations"
  | "commercial";

export type EvidenceSignal = {
  id: string;
  type: EvidenceType;
  label: string;
  detail: string;
  observed_at: string;
  strength: "strong" | "medium" | "weak";
  source: string;
};

export type SyntheticBusiness = {
  id: string;
  name: string;
  sector: Sector;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  founded_year: number;
  employee_estimate: number;
  revenue_estimate_eur: number;
  ebitda_margin: number;
  recurring_revenue_ratio: number;
  review_rating: number;
  review_count: number;
  website_freshness_years: number;
  management_visibility: number;
  owner_contact_prominence: number;
  hiring_signal: boolean;
  contactability: number;
  evidence: EvidenceSignal[];
};

export type ScoreBreakdown = {
  thesis_fit: number;
  economic_attractiveness: number;
  evidence_quality: number;
  succession_signals: number;
  contactability: number;
  data_completeness: number;
};

export type QualifiedTarget = {
  id: string;
  name: string;
  sector: Sector;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  founded_year: number;
  employee_estimate: number;
  qualification_score: number;
  confidence: number;
  score_breakdown: ScoreBreakdown;
  estimated_financials: {
    revenue_eur: number;
    ebitda_eur: number;
    ebitda_margin: number;
    recurring_revenue_ratio: number;
  };
  valuation_range_eur: {
    low: number;
    high: number;
    methodology: string;
  };
  evidence: EvidenceSignal[];
  inferences: string[];
  unknowns: string[];
  why_it_fits: string[];
  contact_path: {
    channel: "business_email" | "business_phone" | "contact_form";
    value: string;
    note: string;
  };
  next_action: string;
  listed_for_sale: false;
};

export type FinancingSnapshot = {
  target_id: string;
  midpoint_valuation_eur: number;
  buyer_cash_eur: number;
  senior_debt_eur: number;
  seller_note_eur: number;
  annual_debt_service_eur: number;
  estimated_dscr: number;
  assumption: string;
  disclaimer: string;
};

export type OutreachPacket = {
  target_id: string;
  email_subject: string;
  email_body: string;
  call_opener: string;
  diligence_questions: string[];
};

export type CampaignOutput = {
  campaign_id: string;
  generated_at: string;
  disclosure: typeof DISCLOSURE;
  thesis_summary: string;
  targets: QualifiedTarget[];
  top_target_id: string;
  financing_snapshot: FinancingSnapshot;
  outreach_packet: OutreachPacket;
  campaign_url: string;
};

