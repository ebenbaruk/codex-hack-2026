import { createHash, randomUUID } from "node:crypto";
import { syntheticBusinesses, sectorLabels } from "./data";
import { acquisitionInputSchema, campaignOutputSchema } from "./schema";
import {
  DISCLOSURE,
  type AcquisitionInput,
  type CampaignOutput,
  type FinancingSnapshot,
  type OutreachPacket,
  type QualifiedTarget,
  type ScoreBreakdown,
  type SyntheticBusiness,
} from "./types";

export const defaultAcquisitionInput: AcquisitionInput = {
  region: "Auvergne-Rhône-Alpes",
  sectors: ["hvac", "plumbing"],
  cash_available_eur: 250_000,
  revenue_range_eur: {
    min: 750_000,
    max: 4_000_000,
  },
  buyer_profile:
    "Hands-on operator seeking a recurring-revenue local service business",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function scoreBusiness(
  business: SyntheticBusiness,
  input: AcquisitionInput,
): { score: number; confidence: number; breakdown: ScoreBreakdown } {
  const sectorMatch = input.sectors.includes(business.sector) ? 18 : 4;
  const inRevenueRange =
    business.revenue_estimate_eur >= input.revenue_range_eur.min &&
    business.revenue_estimate_eur <= input.revenue_range_eur.max;
  const distanceFit = ["Lyon", "Villeurbanne", "Vienne", "Saint-Étienne"].includes(
    business.city,
  )
    ? 6
    : 3;
  const thesisFit = clamp(sectorMatch + (inRevenueRange ? 6 : 1) + distanceFit, 0, 30);

  const marginScore = clamp((business.ebitda_margin - 0.08) * 80, 0, 10);
  const recurringScore = clamp(business.recurring_revenue_ratio * 10, 0, 10);
  const economic = round(marginScore + recurringScore);

  const evidenceStrength = business.evidence.reduce((total, evidence) => {
    return total + (evidence.strength === "strong" ? 3 : evidence.strength === "medium" ? 2 : 1);
  }, 0);
  const evidenceQuality = clamp(round((evidenceStrength / 18) * 20), 0, 20);

  const tenure = 2026 - business.founded_year;
  const succession =
    clamp((tenure - 10) / 3, 0, 7) +
    clamp(business.owner_contact_prominence * 5, 0, 5) +
    clamp((1 - business.management_visibility) * 3, 0, 3);

  const contactability = round(business.contactability * 10);
  const dataCompleteness = clamp(
    2 + (business.review_count > 50 ? 1 : 0) + (business.evidence.length >= 5 ? 2 : 1),
    0,
    5,
  );

  const breakdown: ScoreBreakdown = {
    thesis_fit: round(thesisFit),
    economic_attractiveness: economic,
    evidence_quality: evidenceQuality,
    succession_signals: round(succession),
    contactability,
    data_completeness: round(dataCompleteness),
  };

  const score = Object.values(breakdown).reduce((total, value) => total + value, 0);
  const confidence = clamp(
    round(45 + business.evidence.length * 5 + business.contactability * 14),
    55,
    92,
  );

  return { score, confidence, breakdown };
}

function valuationFor(business: SyntheticBusiness) {
  const ebitda = round(business.revenue_estimate_eur * business.ebitda_margin);
  const multiple =
    business.sector === "industrial_maintenance"
      ? 4.3
      : business.recurring_revenue_ratio > 0.65
        ? 4
        : 3.4;

  return {
    low: round((ebitda * (multiple - 0.45)) / 10_000) * 10_000,
    high: round((ebitda * (multiple + 0.45)) / 10_000) * 10_000,
    methodology: `${(multiple - 0.45).toFixed(1)}×–${(multiple + 0.45).toFixed(1)}× synthetic EBITDA estimate; not a valuation opinion.`,
  };
}

function qualifyBusiness(
  business: SyntheticBusiness,
  input: AcquisitionInput,
): QualifiedTarget {
  const { score, confidence, breakdown } = scoreBusiness(business, input);
  const ebitda = round(business.revenue_estimate_eur * business.ebitda_margin);
  const valuation = valuationFor(business);
  const recurringPct = round(business.recurring_revenue_ratio * 100);

  const inferences = [
    business.owner_contact_prominence > 0.68
      ? "The visible commercial identity appears concentrated around the dirigeant role."
      : "The business appears reachable through a general company contact path.",
    business.management_visibility < 0.42
      ? "A discreet succession conversation may be timely because no clear second management layer is visible."
      : "Visible operational management could support a structured ownership transition.",
    business.recurring_revenue_ratio > 0.58
      ? "The service mix may support predictable post-acquisition cash flow."
      : "Revenue quality should be verified before advancing.",
  ];

  const unknowns = [
    "Actual owner willingness to discuss a transaction",
    "Customer concentration and contract transferability",
    "Normalized EBITDA and owner compensation",
    "Working-capital seasonality and maintenance capex",
  ];

  return {
    id: business.id,
    name: business.name,
    sector: business.sector,
    city: business.city,
    department: business.department,
    latitude: business.latitude,
    longitude: business.longitude,
    founded_year: business.founded_year,
    employee_estimate: business.employee_estimate,
    qualification_score: score,
    confidence,
    score_breakdown: breakdown,
    estimated_financials: {
      revenue_eur: business.revenue_estimate_eur,
      ebitda_eur: ebitda,
      ebitda_margin: business.ebitda_margin,
      recurring_revenue_ratio: business.recurring_revenue_ratio,
    },
    valuation_range_eur: valuation,
    evidence: business.evidence,
    inferences,
    unknowns,
    why_it_fits: [
      `${sectorLabels[business.sector]} fits the selected acquisition thesis.`,
      `${recurringPct}% estimated recurring revenue creates a credible service base.`,
      `${business.city} supports regional sourcing density around Lyon.`,
      `${business.employee_estimate} estimated employees suggests an established operating footprint.`,
    ],
    contact_path: {
      channel: business.contactability > 0.82 ? "business_email" : "contact_form",
      value:
        business.contactability > 0.82
          ? `direction@${business.id}.example.invalid`
          : `https://${business.id}.example.invalid/contact`,
      note: "Synthetic demo contact path. No message will be sent.",
    },
    next_action:
      "Validate ownership and financial profile, then request a confidential 20-minute succession conversation.",
    listed_for_sale: false,
  };
}

function buildFinancingSnapshot(
  target: QualifiedTarget,
  cash: number,
): FinancingSnapshot {
  const midpoint = round(
    (target.valuation_range_eur.low + target.valuation_range_eur.high) / 2,
  );
  const buyerCash = Math.min(cash, round(midpoint * 0.3));
  const sellerNote = round(midpoint * 0.15);
  const seniorDebt = Math.max(0, midpoint - buyerCash - sellerNote);
  const annualDebtService = round(seniorDebt * 0.154 + sellerNote * 0.08);
  const dscr = Number(
    (target.estimated_financials.ebitda_eur / Math.max(1, annualDebtService)).toFixed(2),
  );

  return {
    target_id: target.id,
    midpoint_valuation_eur: midpoint,
    buyer_cash_eur: buyerCash,
    senior_debt_eur: seniorDebt,
    seller_note_eur: sellerNote,
    annual_debt_service_eur: annualDebtService,
    estimated_dscr: dscr,
    assumption:
      "Illustrative 15% seller note and blended annual debt service estimate using synthetic EBITDA.",
    disclaimer:
      "Scenario modelling only. Figures are synthetic and are not financing or investment advice.",
  };
}

function buildOutreachPacket(target: QualifiedTarget): OutreachPacket {
  return {
    target_id: target.id,
    email_subject: `Échange confidentiel concernant ${target.name.replace(" — Démo", "")}`,
    email_body: `Bonjour,\n\nJe m'intéresse aux entreprises de services techniques durablement implantées dans la région, et ${target.name.replace(" — Démo", "")} a retenu mon attention pour son ancrage à ${target.city} et la qualité apparente de son activité récurrente.\n\nJe ne représente pas un fonds et je ne cherche pas à lancer un processus formel. Je souhaite simplement savoir si une conversation confidentielle sur vos projets à moyen terme pourrait avoir du sens.\n\nSeriez-vous disponible pour un échange de 20 minutes la semaine prochaine ?\n\nBien cordialement,`,
    call_opener: `Bonjour, je vous appelle au sujet de ${target.name.replace(" — Démo", "")}. Je suis un entrepreneur qui étudie la reprise d'une entreprise de services techniques dans la région. Ce n'est pas un appel commercial : j'aimerais comprendre vos projets à moyen terme et voir si une conversation confidentielle pourrait être pertinente.`,
    diligence_questions: [
      "Quelle part du chiffre d'affaires provient de contrats récurrents ?",
      "Quel est votre rôle opérationnel au quotidien ?",
      "Qui gère aujourd'hui les devis, le planning et les relations clients clés ?",
      "Quelle est la concentration des cinq premiers clients ?",
      "Quels investissements matériels seront nécessaires dans les trois prochaines années ?",
      "Quelles seraient vos priorités pour assurer une transition réussie ?",
    ],
  };
}

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
    .join(",")}}`;
}

export function fingerprintInput(input: AcquisitionInput): string {
  return createHash("sha256").update(canonicalize(input)).digest("hex");
}

export function generateCampaign(
  rawInput: AcquisitionInput,
  options?: { campaignId?: string; baseUrl?: string; generatedAt?: string },
): CampaignOutput {
  const input = acquisitionInputSchema.parse(rawInput);
  const targets = syntheticBusinesses
    .map((business) => qualifyBusiness(business, input))
    .sort((a, b) => {
      if (b.qualification_score !== a.qualification_score) {
        return b.qualification_score - a.qualification_score;
      }
      return b.confidence - a.confidence;
    })
    .slice(0, 10);

  const topTarget = targets[0];
  const campaignId = options?.campaignId ?? randomUUID();
  const baseUrl = (options?.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  const output: CampaignOutput = {
    campaign_id: campaignId,
    generated_at: options?.generatedAt ?? new Date().toISOString(),
    disclosure: DISCLOSURE,
    thesis_summary: `Find established ${input.sectors.map((sector) => sectorLabels[sector]).join(" and ")} businesses in ${input.region} with €${input.cash_available_eur.toLocaleString("en-US")} available equity and synthetic revenue between €${input.revenue_range_eur.min.toLocaleString("en-US")} and €${input.revenue_range_eur.max.toLocaleString("en-US")}.`,
    targets,
    top_target_id: topTarget.id,
    financing_snapshot: buildFinancingSnapshot(topTarget, input.cash_available_eur),
    outreach_packet: buildOutreachPacket(topTarget),
    campaign_url: `${baseUrl}/campaigns/${campaignId}`,
  };

  return campaignOutputSchema.parse(output);
}

export const demoCampaign = generateCampaign(defaultAcquisitionInput, {
  campaignId: "demo-lyon-services",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  generatedAt: "2026-07-18T09:30:00.000Z",
});
