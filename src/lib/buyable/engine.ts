import { createHash, randomUUID } from "node:crypto";
import {
  sectorLabels,
  sectorValuationMultiples,
  syntheticBusinesses,
} from "./data";
import {
  baseDscrForBusiness,
  buildOfferScenarios,
  calculateFinanceabilityScore,
} from "./finance";
import { acquisitionInputSchema, campaignOutputSchema } from "./schema";
import {
  DISCLOSURE,
  type AcquisitionInput,
  type AcquisitionSignal,
  type CampaignOutput,
  type FinancingSnapshot,
  type GeneratedArtifact,
  type MarketFunnel,
  type OutreachPacket,
  type QualifiedTarget,
  type RejectionReason,
  type ScoreBreakdown,
  type SyntheticBusiness,
  type TopAcquisitionCase,
} from "./types";

export const defaultAcquisitionInput: AcquisitionInput = {
  region: "Auvergne-Rhône-Alpes",
  target_city: "Lyon",
  sectors: ["hvac", "plumbing"],
  cash_available_eur: 250_000,
  revenue_range_eur: {
    min: 750_000,
    max: 4_000_000,
  },
  employee_range: {
    min: 6,
    max: 60,
  },
  preferred_signals: [
    "recurring_revenue",
    "management_depth",
    "low_capex",
  ],
  avoid_signals: ["high_capex", "customer_concentration"],
  buyer_profile:
    "Hands-on operator seeking a recurring-revenue local service business",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, step = 1) {
  return Math.round(value / step) * step;
}

function strengthValue(strength: "strong" | "medium" | "weak") {
  return strength === "strong" ? 3 : strength === "medium" ? 2 : 1;
}

function hasSignal(business: SyntheticBusiness, signal: AcquisitionSignal) {
  if (signal === "recurring_revenue") {
    return business.recurring_revenue_ratio >= 0.62;
  }
  if (signal === "management_depth") {
    return business.management_visibility >= 0.58;
  }
  if (signal === "low_capex") {
    return business.maintenance_capex_ratio <= 0.04;
  }
  if (signal === "diversified_customers") {
    return business.customer_concentration_ratio <= 0.22;
  }
  return business.transition_signals.some((item) => item.strength !== "weak");
}

function valuationFor(business: SyntheticBusiness) {
  const latest = business.financial_history.at(-1);
  const ebitda = latest?.ebitda_eur ?? round(
    business.revenue_estimate_eur * business.ebitda_margin,
  );
  const baseMultiple = sectorValuationMultiples[business.sector];
  const recurringPremium =
    business.recurring_revenue_ratio >= 0.75
      ? 0.35
      : business.recurring_revenue_ratio < 0.4
        ? -0.25
        : 0;
  const concentrationAdjustment =
    business.customer_concentration_ratio > 0.32 ? -0.3 : 0;
  const midpointMultiple = clamp(
    baseMultiple + recurringPremium + concentrationAdjustment,
    3,
    5.3,
  );
  const midpoint = round(ebitda * midpointMultiple, 10_000);

  return {
    low: round(midpoint * 0.86, 10_000),
    high: round(midpoint * 1.14, 10_000),
    midpoint,
    methodology: `${(midpointMultiple * 0.86).toFixed(1)}×–${(midpointMultiple * 1.14).toFixed(1)}× synthetic normalized EBITDA; illustrative enterprise value, not a valuation opinion.`,
  };
}

function scoreBusiness(
  business: SyntheticBusiness,
  input: AcquisitionInput,
  valuation: ReturnType<typeof valuationFor>,
): {
  score: number;
  confidence: number;
  breakdown: ScoreBreakdown;
  financeability: QualifiedTarget["financeability"];
} {
  const latest = business.financial_history.at(-1)!;
  const first = business.financial_history[0];
  const revenueCagr = Math.pow(latest.revenue_eur / first.revenue_eur, 1 / 2) - 1;

  const marginScore = clamp((business.ebitda_margin - 0.075) * 58, 0, 9);
  const recurringScore = clamp(business.recurring_revenue_ratio * 7, 0, 7);
  const growthScore = clamp(revenueCagr * 55, 0, 4);
  const concentrationScore = clamp(
    (0.42 - business.customer_concentration_ratio) * 20,
    0,
    5,
  );
  const economicQuality = round(
    marginScore + recurringScore + growthScore + concentrationScore,
  );

  const sectorFit = input.sectors.includes(business.sector) ? 8 : 0;
  const geographyFit =
    input.region === "France"
      ? input.target_city
        ? business.city === input.target_city
          ? 4
          : 2
        : 4
      : business.region === input.region
        ? input.target_city
          ? business.city === input.target_city
            ? 4
            : 2
          : 4
        : 0;
  const revenueFit =
    business.revenue_estimate_eur >= input.revenue_range_eur.min &&
    business.revenue_estimate_eur <= input.revenue_range_eur.max
      ? 4
      : 0;
  const employeeFit =
    !input.employee_range ||
    (business.employee_estimate >= input.employee_range.min &&
      business.employee_estimate <= input.employee_range.max)
      ? 2
      : 0;
  const preferred = input.preferred_signals ?? [];
  const preferenceFit = preferred.length
    ? (preferred.filter((signal) => hasSignal(business, signal)).length /
        preferred.length) *
      2
    : 2;
  const buyerFit = round(
    sectorFit + geographyFit + revenueFit + employeeFit + preferenceFit,
  );

  const finance = calculateFinanceabilityScore({
    valuationMidpointEur: valuation.midpoint,
    freeCashFlowEur: latest.free_cash_flow_eur,
    existingDebtEur: business.debt_eur,
    cashAvailableEur: input.cash_available_eur,
  });

  const operationalTransferability = round(
    clamp(business.management_visibility * 6, 0, 6) +
      clamp(business.recurring_revenue_ratio * 4, 0, 4) +
      clamp((0.09 - business.maintenance_capex_ratio) * 50, 0, 3) +
      clamp(business.digital_maturity * 2, 0, 2),
  );

  const transitionRaw = business.transition_signals.reduce(
    (total, signal) => total + strengthValue(signal.strength),
    0,
  );
  const transitionSignals = round(clamp(transitionRaw * 1.35, 0, 10));
  const contactability = round(business.contactability * 5);
  const dataCompleteness = clamp(
    (business.evidence.length >= 8 ? 2 : 1) +
      (business.financial_history.length === 3 ? 1 : 0) +
      (business.contact_paths.length >= 2 ? 1 : 0) +
      (business.transition_signals.length >= 2 ? 1 : 0),
    0,
    5,
  );

  const breakdown: ScoreBreakdown = {
    economic_quality: clamp(economicQuality, 0, 25),
    buyer_fit: clamp(buyerFit, 0, 20),
    financeability: finance.score,
    operational_transferability: clamp(operationalTransferability, 0, 15),
    transition_signals: transitionSignals,
    contactability,
    data_completeness: dataCompleteness,
  };
  const score = Object.values(breakdown).reduce(
    (total, value) => total + value,
    0,
  );
  const evidenceStrength = business.evidence.reduce(
    (total, evidence) => total + strengthValue(evidence.strength),
    0,
  );
  const confidence = round(
    clamp(
      48 +
        (evidenceStrength / (business.evidence.length * 3)) * 30 +
        dataCompleteness * 3 +
        business.contactability * 5,
      60,
      96,
    ),
  );
  const baseDscr = baseDscrForBusiness(
    business,
    finance.estimated_debt_capacity_eur,
  );
  const financeability = {
    required_equity_eur: finance.required_equity_eur,
    equity_gap_eur: finance.equity_gap_eur,
    affordable_with_current_cash: finance.affordable_with_current_cash,
    estimated_debt_capacity_eur: finance.estimated_debt_capacity_eur,
  };

  return {
    score,
    confidence,
    breakdown,
    financeability: {
      ...financeability,
      base_dscr: baseDscr,
    },
  };
}

function qualifyBusiness(
  business: SyntheticBusiness,
  input: AcquisitionInput,
): QualifiedTarget {
  const valuation = valuationFor(business);
  const { score, confidence, breakdown, financeability } = scoreBusiness(
    business,
    input,
    valuation,
  );
  const latest = business.financial_history.at(-1)!;
  const first = business.financial_history[0];
  const revenueCagr =
    Math.pow(latest.revenue_eur / first.revenue_eur, 1 / 2) - 1;
  const recurringPct = Math.round(business.recurring_revenue_ratio * 100);
  const managementMessage =
    business.management_visibility >= 0.58
      ? "A visible operating layer may support continuity beyond the current dirigeant."
      : "Management depth is limited in the synthetic profile and must be diligenced.";
  const transitionMessage =
    business.transition_signals.some((signal) => signal.strength === "strong")
      ? "At least one strong, observable transition signal justifies a discreet conversation."
      : "Transition intent remains unknown; the evidence only supports respectful outreach.";

  const whyBuy = [
    `${sectorLabels[business.sector]} fits the selected acquisition thesis.`,
    `${recurringPct}% estimated recurring revenue supports cash-flow visibility.`,
    `${Math.round(business.ebitda_margin * 100)}% synthetic EBITDA margin and positive three-year growth support the economic case.`,
    financeability.affordable_with_current_cash
      ? `The midpoint scenario is potentially financeable with ${input.cash_available_eur.toLocaleString("fr-FR")} € of buyer cash.`
      : "A larger seller note, earn-out or additional equity would be needed at the midpoint valuation.",
  ];

  const whyNot = [
    business.customer_concentration_ratio > 0.28
      ? `Estimated top-customer concentration of ${Math.round(business.customer_concentration_ratio * 100)}% creates diligence risk.`
      : "Customer concentration still needs confirmation from the underlying ledger.",
    business.management_visibility < 0.45
      ? "The operation may depend materially on the current dirigeant."
      : "Visible management roles have not been validated through interviews.",
    business.maintenance_capex_ratio > 0.055
      ? "Maintenance capex appears elevated for a small-business acquisition."
      : "Fleet, equipment condition and deferred capex remain unknown.",
  ];

  const facts = business.evidence
    .filter((evidence) => evidence.classification === "known")
    .slice(0, 4)
    .map((evidence) => evidence.detail);
  const inferences = [
    managementMessage,
    transitionMessage,
    business.recurring_revenue_ratio >= 0.62
      ? "The service mix may support predictable post-acquisition cash flow."
      : "Revenue quality depends on project work and should be verified.",
  ];
  const unknowns = [
    "Actual willingness of the owner to discuss a transaction",
    "Customer concentration, churn and contract transferability",
    "Normalized EBITDA, owner compensation and working-capital seasonality",
    "Condition of equipment and required maintenance capex",
    "Legal, tax, employment and environmental liabilities",
  ];

  return {
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
    conviction_score: score,
    qualification_score: score,
    confidence,
    score_breakdown: breakdown,
    estimated_financials: {
      revenue_eur: latest.revenue_eur,
      ebitda_eur: latest.ebitda_eur,
      ebitda_margin: latest.ebitda_margin,
      recurring_revenue_ratio: business.recurring_revenue_ratio,
      customer_concentration_ratio: business.customer_concentration_ratio,
      maintenance_capex_ratio: business.maintenance_capex_ratio,
      debt_eur: business.debt_eur,
      three_year_revenue_cagr: Number(revenueCagr.toFixed(3)),
      free_cash_flow_eur: latest.free_cash_flow_eur,
      financial_history: business.financial_history,
    },
    valuation_range_eur: valuation,
    financeability,
    evidence: business.evidence,
    transition_signals: business.transition_signals,
    facts,
    inferences,
    unknowns,
    why_buy: whyBuy,
    why_not: whyNot,
    why_it_fits: whyBuy,
    rank_explanation: "",
    contact_paths: business.contact_paths,
    contact_path: business.contact_paths[0],
    next_action:
      "Verify the five critical unknowns, then request a confidential 20-minute continuity conversation.",
    listed_for_sale: false,
  };
}

function matchesThesis(business: SyntheticBusiness, input: AcquisitionInput) {
  const employeeMatch =
    !input.employee_range ||
    (business.employee_estimate >= input.employee_range.min &&
      business.employee_estimate <= input.employee_range.max);
  return (
    (input.region === "France" || business.region === input.region) &&
    input.sectors.includes(business.sector) &&
    business.revenue_estimate_eur >= input.revenue_range_eur.min &&
    business.revenue_estimate_eur <= input.revenue_range_eur.max &&
    employeeMatch
  );
}

function economicallySolid(business: SyntheticBusiness) {
  const latest = business.financial_history.at(-1)!;
  return (
    business.ebitda_margin >= 0.105 &&
    latest.free_cash_flow_eur > 0 &&
    business.customer_concentration_ratio <= 0.38
  );
}

function buildFunnelAndCandidates(
  input: AcquisitionInput,
): {
  funnel: MarketFunnel;
  rejections: RejectionReason[];
  candidates: QualifiedTarget[];
} {
  const geographic = syntheticBusinesses.filter(
    (business) => input.region === "France" || business.region === input.region,
  );
  const sectorMatched = geographic.filter((business) =>
    input.sectors.includes(business.sector),
  );
  const thesisBusinesses = sectorMatched.filter((business) =>
    matchesThesis(business, input),
  );
  const economicBusinesses = thesisBusinesses.filter(economicallySolid);
  const thesisTargets = thesisBusinesses.map((business) =>
    qualifyBusiness(business, input),
  );
  const economicIds = new Set(economicBusinesses.map((business) => business.id));
  const economicTargets = thesisTargets.filter((target) =>
    economicIds.has(target.id),
  );
  const financeableTargets = economicTargets.filter(
    (target) =>
      target.financeability.affordable_with_current_cash ||
      target.score_breakdown.financeability >= 14,
  );
  const transitionTargets = financeableTargets.filter(
    (target) => target.score_breakdown.transition_signals >= 5,
  );
  const allTargets =
    thesisTargets.length >= 10
      ? thesisTargets
      : syntheticBusinesses.map((business) => qualifyBusiness(business, input));
  const candidatePool =
    transitionTargets.length >= 10
      ? transitionTargets
      : financeableTargets.length >= 10
        ? financeableTargets
        : economicTargets.length >= 10
          ? economicTargets
          : allTargets;
  const diversifiedPool = Array.from(
    new Map(
      [...candidatePool, ...allTargets].map((target) => [target.id, target]),
    ).values(),
  );
  const candidates = diversifiedPool.sort((a, b) => {
    if (b.conviction_score !== a.conviction_score) {
      return b.conviction_score - a.conviction_score;
    }
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    if (
      b.estimated_financials.recurring_revenue_ratio !==
      a.estimated_financials.recurring_revenue_ratio
    ) {
      return (
        b.estimated_financials.recurring_revenue_ratio -
        a.estimated_financials.recurring_revenue_ratio
      );
    }
    if (b.financeability.base_dscr !== a.financeability.base_dscr) {
      return b.financeability.base_dscr - a.financeability.base_dscr;
    }
    if (
      a.valuation_range_eur.midpoint !== b.valuation_range_eur.midpoint
    ) {
      return a.valuation_range_eur.midpoint - b.valuation_range_eur.midpoint;
    }
    return a.id.localeCompare(b.id);
  });

  const sectorCap =
    input.sectors.length > 1
      ? Math.ceil(10 / input.sectors.length) + 1
      : 10;
  const curatedCandidates: QualifiedTarget[] = [];
  const sectorCounts = new Map<QualifiedTarget["sector"], number>();
  const companyKeys = new Set<string>();

  for (const target of candidates) {
    const currentCount = sectorCounts.get(target.sector) ?? 0;
    const companyKey = target.name.replace(/\s\d{4} — Démo$/, "");
    if (currentCount >= sectorCap || companyKeys.has(companyKey)) {
      continue;
    }
    curatedCandidates.push(target);
    sectorCounts.set(target.sector, currentCount + 1);
    companyKeys.add(companyKey);
    if (curatedCandidates.length === 10) {
      break;
    }
  }

  if (curatedCandidates.length < 10) {
    for (const target of candidates) {
      if (curatedCandidates.some((candidate) => candidate.id === target.id)) {
        continue;
      }
      const companyKey = target.name.replace(/\s\d{4} — Démo$/, "");
      if (companyKeys.has(companyKey)) {
        continue;
      }
      curatedCandidates.push(target);
      companyKeys.add(companyKey);
      if (curatedCandidates.length === 10) {
        break;
      }
    }
  }

  if (curatedCandidates.length < 10) {
    for (const target of candidates) {
      if (curatedCandidates.some((candidate) => candidate.id === target.id)) {
        continue;
      }
      curatedCandidates.push(target);
      if (curatedCandidates.length === 10) {
        break;
      }
    }
  }

  const topTen = curatedCandidates.sort((a, b) => {
    if (b.conviction_score !== a.conviction_score) {
      return b.conviction_score - a.conviction_score;
    }
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return a.id.localeCompare(b.id);
  });
  const top = topTen[0];
  topTen.forEach((target, index) => {
    const gap = top.conviction_score - target.conviction_score;
    target.rank_explanation =
      index === 0
        ? `Ranked #1 because it combines ${target.score_breakdown.economic_quality}/25 economics, ${target.score_breakdown.financeability}/20 financeability and ${target.score_breakdown.transition_signals}/10 observable transition signals.`
        : `Ranked #${index + 1}; it trails ${top.name} by ${gap} conviction ${gap === 1 ? "point" : "points"}, primarily on ${target.score_breakdown.financeability < top.score_breakdown.financeability ? "financeability" : "economic and operating fit"}.`;
  });

  return {
    funnel: {
      universe_scanned: syntheticBusinesses.length,
      thesis_compatible: thesisBusinesses.length,
      economically_solid: economicTargets.length,
      financeable: financeableTargets.length,
      transition_relevant: transitionTargets.length,
      conviction_list: topTen.length,
    },
    rejections: [
      {
        reason: "Outside selected geography",
        count: syntheticBusinesses.length - geographic.length,
        detail: `Excluded before scoring because the company is outside ${input.region}.`,
      },
      {
        reason: "Sector mismatch",
        count: geographic.length - sectorMatched.length,
        detail: "Excluded because the activity does not match the selected sectors.",
      },
      {
        reason: "Size mismatch",
        count: sectorMatched.length - thesisBusinesses.length,
        detail: "Excluded by revenue or employee-range constraints.",
      },
      {
        reason: "Economic quality below threshold",
        count: thesisBusinesses.length - economicTargets.length,
        detail: "Insufficient margin, cash conversion or customer diversification.",
      },
      {
        reason: "Financing gap",
        count: economicTargets.length - financeableTargets.length,
        detail: "Illustrative equity and debt capacity do not support the midpoint price.",
      },
      {
        reason: "Transition evidence too weak",
        count: financeableTargets.length - transitionTargets.length,
        detail: "No sufficiently strong observable continuity or leadership signal.",
      },
    ].filter((item) => item.count > 0),
    candidates: topTen,
  };
}

function buildOutreachPacket(target: QualifiedTarget): OutreachPacket {
  const cleanName = target.name.replace(" — Démo", "");
  const questions = [
    "Quelle part du chiffre d’affaires provient de contrats récurrents ?",
    "Quel est aujourd’hui votre rôle opérationnel au quotidien ?",
    "Qui gère les devis, le planning et les relations avec les clients clés ?",
    "Quelle est la concentration des cinq premiers clients ?",
    "Quels investissements matériels seront nécessaires dans les trois prochaines années ?",
    "Quelles seraient vos priorités pour préserver l’équipe et les savoir-faire ?",
  ];
  return {
    target_id: target.id,
    email_subject: `Échange confidentiel concernant ${cleanName}`,
    email_body: `Bonjour,\n\nJe recherche personnellement une entreprise de services durablement implantée à ${target.city}. ${cleanName} a retenu mon attention pour son activité, son équipe et la continuité apparente de ses services.\n\nJe ne lance pas un processus formel et je ne présume pas de vos intentions. Je souhaiterais simplement comprendre vos projets à moyen terme et voir si une conversation confidentielle sur la continuité de l’entreprise pourrait avoir du sens.\n\nSeriez-vous disponible pour un échange de 20 minutes la semaine prochaine ?\n\nBien cordialement,`,
    call_opener: `Bonjour, je vous appelle au sujet de ${cleanName}. Je suis un entrepreneur qui étudie la reprise d’une entreprise de services à ${target.city}. Je ne présume pas que vous souhaitiez vendre ; j’aimerais simplement comprendre vos projets à moyen terme et voir si un échange confidentiel pourrait être pertinent.`,
    first_meeting_questions: questions,
    diligence_questions: questions,
  };
}

function buildAcquisitionCase(
  target: QualifiedTarget,
): TopAcquisitionCase {
  const cleanName = target.name.replace(" — Démo", "");
  return {
    target_id: target.id,
    executive_summary: `${cleanName} is Buyable’s highest-conviction target for this buyer: a synthetic ${sectorLabels[target.sector]} company in ${target.city} with ${target.employee_estimate} employees, ${target.conviction_score}/100 conviction and ${target.confidence}% evidence confidence.`,
    investment_thesis: target.why_buy,
    why_now: [
      ...target.transition_signals.slice(0, 2).map((signal) => signal.detail),
      "The company is not listed for sale, so a respectful direct approach may avoid a competitive auction.",
    ],
    key_risks: target.why_not,
    deal_breakers: [
      "Normalized EBITDA below 70% of the synthetic estimate",
      "Any single customer above 35% of revenue without a transferable contract",
      "Unfunded capex or working-capital need above 15% of enterprise value",
      "No credible operating continuity without the current dirigeant",
    ],
    information_request: [
      {
        section: "Financial",
        documents: [
          "Three years of statutory accounts and detailed general ledger",
          "Monthly management accounts and current-year forecast",
          "Debt, leases, working-capital and capex schedules",
        ],
      },
      {
        section: "Commercial",
        documents: [
          "Customer revenue by account for three years",
          "Contract list with renewal and change-of-control terms",
          "Pipeline, churn and pricing history",
        ],
      },
      {
        section: "Operations and people",
        documents: [
          "Organization chart, compensation and tenure",
          "Owner’s weekly responsibilities and key-person dependencies",
          "Fleet, equipment, certifications and maintenance records",
        ],
      },
      {
        section: "Legal and tax",
        documents: [
          "Corporate records, material contracts and litigation schedule",
          "Tax filings, payroll audits and environmental matters",
          "Insurance claims and regulatory correspondence",
        ],
      },
    ],
    lender_memo: {
      request: `Indicative senior acquisition financing for ${cleanName}, subject to full diligence and lender underwriting.`,
      credit_case: [
        `${Math.round(target.estimated_financials.recurring_revenue_ratio * 100)}% synthetic recurring revenue.`,
        `${Math.round(target.estimated_financials.ebitda_margin * 100)}% synthetic EBITDA margin and ${Math.round(target.estimated_financials.three_year_revenue_cagr * 100)}% three-year CAGR.`,
        `${target.financeability.estimated_debt_capacity_eur.toLocaleString("fr-FR")} € estimated debt capacity before lender adjustments.`,
      ],
      mitigants: [
        "Condition funding on verified normalized EBITDA and customer concentration.",
        "Use seller deferred consideration to align transition support.",
        "Maintain a working-capital and capex reserve at closing.",
      ],
    },
    loi_draft: `NON-BINDING INDICATIVE LETTER OF INTENT — DRAFT FOR PROFESSIONAL REVIEW\n\nBuyer proposes to acquire 100% of ${cleanName}, subject to confirmatory financial, legal, tax, commercial and operational due diligence. Indicative enterprise value: ${target.valuation_range_eur.low.toLocaleString("fr-FR")} € to ${target.valuation_range_eur.high.toLocaleString("fr-FR")} €, with final price and structure dependent on normalized EBITDA, debt, cash and working capital. The preferred structure may combine buyer equity, senior debt, seller deferred consideration and a performance-based earn-out. This draft is non-binding except for any confidentiality and exclusivity provisions later agreed by counsel.`,
    hundred_day_plan: [
      {
        phase: "Protect",
        days: "Days 1–30",
        priorities: [
          "Retain employees and reassure key customers",
          "Document the dirigeant’s recurring responsibilities",
          "Freeze non-essential changes while validating cash flow",
        ],
      },
      {
        phase: "Transfer",
        days: "Days 31–60",
        priorities: [
          "Move customer and supplier ownership to the management team",
          "Install weekly cash, pipeline and service-quality reporting",
          "Complete operational knowledge transfer",
        ],
      },
      {
        phase: "Improve",
        days: "Days 61–100",
        priorities: [
          "Launch pricing and contract-renewal opportunities",
          "Prioritize low-risk digital and scheduling improvements",
          "Confirm the 12-month growth and capex plan",
        ],
      },
    ],
  };
}

function buildArtifacts(
  target: QualifiedTarget,
): GeneratedArtifact[] {
  return [
    ["investment_memo", "Acquisition investment memo"],
    ["offer_scenarios", "Three indicative offer structures"],
    ["seller_approach", "Confidential seller approach"],
    ["lender_memo", "Indicative lender memo"],
    ["loi_draft", "Non-binding LOI draft"],
    ["diligence_checklist", "Due-diligence request list"],
    ["hundred_day_plan", "First 100 days plan"],
  ].map(([type, title]) => ({
    id: `${target.id}-${type}`,
    type: type as GeneratedArtifact["type"],
    title,
    status: "draft" as const,
    review_required: true,
  }));
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
  const { funnel, rejections, candidates } = buildFunnelAndCandidates(input);
  const topTarget = candidates[0];
  const runnerUp = candidates[1];
  const offerScenarios = buildOfferScenarios(
    topTarget,
    input.cash_available_eur,
  );
  const balancedScenario =
    offerScenarios.find((scenario) => scenario.id === "balanced") ??
    offerScenarios[0];
  const financingSnapshot: FinancingSnapshot = {
    target_id: topTarget.id,
    midpoint_valuation_eur: balancedScenario.enterprise_value_eur,
    buyer_cash_eur: balancedScenario.buyer_cash_eur,
    senior_debt_eur: balancedScenario.senior_debt_eur,
    seller_note_eur: balancedScenario.seller_note_eur,
    earnout_eur: balancedScenario.earnout_eur,
    annual_debt_service_eur: balancedScenario.annual_debt_service_eur,
    estimated_dscr: balancedScenario.estimated_dscr,
    equity_gap_eur: topTarget.financeability.equity_gap_eur,
    assumption:
      "Illustrative seven-year senior debt and three-year seller-note service; all figures use synthetic data.",
    disclaimer:
      "Scenario modelling only. This is not investment, legal, tax or financing advice.",
  };
  const outreach = buildOutreachPacket(topTarget);
  const topAcquisitionCase = buildAcquisitionCase(topTarget);
  const convictionLead = topTarget.conviction_score - runnerUp.conviction_score;
  const rankingLead =
    convictionLead > 0
      ? `${convictionLead} ${convictionLead === 1 ? "point" : "points"} ahead of #2 ${runnerUp.name}.`
      : topTarget.confidence > runnerUp.confidence
        ? `Tied at ${topTarget.conviction_score}/100 with #2 ${runnerUp.name}; #1 wins on higher evidence confidence.`
        : topTarget.estimated_financials.recurring_revenue_ratio >
            runnerUp.estimated_financials.recurring_revenue_ratio
          ? `Tied at ${topTarget.conviction_score}/100 with #2 ${runnerUp.name}; #1 wins on recurring-revenue quality.`
          : topTarget.financeability.base_dscr >
              runnerUp.financeability.base_dscr
            ? `Tied at ${topTarget.conviction_score}/100 with #2 ${runnerUp.name}; #1 wins on estimated debt-service coverage.`
            : `Tied at ${topTarget.conviction_score}/100 with #2 ${runnerUp.name}; #1 wins the disclosed deterministic tie-break after equivalent rounded metrics.`;
  const campaignId = options?.campaignId ?? randomUUID();
  const baseUrl = (
    options?.baseUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const regionDescription =
    input.region === "France" ? "France" : input.region;

  const output: CampaignOutput = {
    schema_version: "2",
    campaign_id: campaignId,
    generated_at: options?.generatedAt ?? new Date().toISOString(),
    disclosure: DISCLOSURE,
    thesis_summary: `Curate the highest-conviction ${input.sectors.map((sector) => sectorLabels[sector]).join(" and ")} acquisition targets in ${regionDescription} for a buyer with ${input.cash_available_eur.toLocaleString("fr-FR")} € of available cash and a synthetic revenue range of ${input.revenue_range_eur.min.toLocaleString("fr-FR")} €–${input.revenue_range_eur.max.toLocaleString("fr-FR")} €.`,
    applied_filters: input,
    market_funnel: funnel,
    rejection_reasons: rejections,
    targets: candidates,
    conviction_targets: candidates,
    top_target_id: topTarget.id,
    ranking_explanation: {
      headline: `${topTarget.name} is the #1 acquisition conviction at ${topTarget.conviction_score}/100.`,
      why_number_one_wins: [
        rankingLead,
        `${topTarget.score_breakdown.economic_quality}/25 economic quality with ${Math.round(topTarget.estimated_financials.recurring_revenue_ratio * 100)}% recurring revenue.`,
        `${topTarget.score_breakdown.financeability}/20 financeability and an estimated ${topTarget.financeability.base_dscr.toFixed(2)}× base DSCR.`,
        `${topTarget.score_breakdown.transition_signals}/10 transition evidence, without inferring age or willingness to sell.`,
      ],
      methodology:
        "Conviction combines economic quality, buyer fit, financeability, operating transferability, observable transition signals, contactability and data completeness.",
      limitation:
        "Best means highest-ranked inside the disclosed synthetic universe and selected criteria. Owner intent and all material facts remain unverified.",
    },
    top_acquisition_case: topAcquisitionCase,
    financing_snapshot: financingSnapshot,
    offer_scenarios: offerScenarios,
    outreach_packet: outreach,
    generated_artifacts: buildArtifacts(topTarget),
    campaign_url: `${baseUrl}/campaigns/${campaignId}`,
  };

  return campaignOutputSchema.parse(output);
}

export function normalizeCampaignOutput(
  rawOutput: unknown,
  rawInput?: unknown,
): CampaignOutput {
  const current = campaignOutputSchema.safeParse(rawOutput);
  if (current.success) {
    return current.data;
  }

  const legacy = rawOutput as {
    campaign_id?: string;
    campaign_url?: string;
    generated_at?: string;
  };
  const parsedInput = acquisitionInputSchema.safeParse(rawInput);
  const input = parsedInput.success
    ? parsedInput.data
    : defaultAcquisitionInput;
  const baseUrl = legacy.campaign_url
    ? new URL(legacy.campaign_url).origin
    : process.env.NEXT_PUBLIC_APP_URL;

  return generateCampaign(input, {
    campaignId: legacy.campaign_id,
    baseUrl,
    generatedAt: legacy.generated_at,
  });
}

export const demoCampaign = generateCampaign(defaultAcquisitionInput, {
  campaignId: "demo-lyon-services",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  generatedAt: "2026-07-18T09:30:00.000Z",
});
