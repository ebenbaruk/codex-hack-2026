import type {
  OfferScenario,
  QualifiedTarget,
  SyntheticBusiness,
} from "./types";

const SENIOR_DEBT_SERVICE_FACTOR = 0.185;
const SELLER_NOTE_SERVICE_FACTOR = 0.367;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rounded(value: number, step = 1_000) {
  return Math.round(value / step) * step;
}

export function estimateDebtCapacity(
  freeCashFlowEur: number,
  existingDebtEur = 0,
) {
  const serviceCapacity = Math.max(0, freeCashFlowEur / 1.35);
  return Math.max(
    0,
    rounded(serviceCapacity / SENIOR_DEBT_SERVICE_FACTOR - existingDebtEur),
  );
}

export function calculateFinanceabilityScore({
  valuationMidpointEur,
  freeCashFlowEur,
  existingDebtEur,
  cashAvailableEur,
}: {
  valuationMidpointEur: number;
  freeCashFlowEur: number;
  existingDebtEur: number;
  cashAvailableEur: number;
}) {
  const requiredEquity = rounded(valuationMidpointEur * 0.25);
  const equityCoverage = clamp(cashAvailableEur / Math.max(1, requiredEquity), 0, 1.2);
  const debtCapacity = estimateDebtCapacity(freeCashFlowEur, existingDebtEur);
  const debtNeed = Math.max(0, valuationMidpointEur - Math.min(cashAvailableEur, requiredEquity) - valuationMidpointEur * 0.15);
  const debtCoverage = clamp(debtCapacity / Math.max(1, debtNeed), 0, 1.1);
  const score = Math.round(clamp(equityCoverage * 12 + debtCoverage * 8, 0, 20));

  return {
    score,
    required_equity_eur: requiredEquity,
    equity_gap_eur: Math.max(0, requiredEquity - cashAvailableEur),
    affordable_with_current_cash:
      cashAvailableEur >= requiredEquity * 0.8 && debtCoverage >= 0.8,
    estimated_debt_capacity_eur: debtCapacity,
  };
}

type FinanceTarget = Pick<
  QualifiedTarget,
  "id" | "valuation_range_eur" | "estimated_financials" | "financeability"
>;

function createScenario(
  target: FinanceTarget,
  cashAvailableEur: number,
  config: {
    id: OfferScenario["id"];
    label: string;
    cashShare: number;
    debtShare: number;
    sellerNoteShare: number;
    earnoutShare: number;
    rationale: string;
  },
): OfferScenario {
  const price = target.valuation_range_eur.midpoint;
  const buyerCash = Math.min(cashAvailableEur, rounded(price * config.cashShare));
  const seniorDebt = Math.min(
    target.financeability.estimated_debt_capacity_eur,
    rounded(price * config.debtShare),
  );
  const sellerNote = rounded(price * config.sellerNoteShare);
  const earnout = Math.max(
    rounded(price * config.earnoutShare),
    price - buyerCash - seniorDebt - sellerNote,
  );
  const annualDebtService = rounded(
    seniorDebt * SENIOR_DEBT_SERVICE_FACTOR +
      sellerNote * SELLER_NOTE_SERVICE_FACTOR,
  );
  const cashFlow = target.estimated_financials.free_cash_flow_eur;
  const dscr = Number((cashFlow / Math.max(1, annualDebtService)).toFixed(2));

  return {
    id: config.id,
    label: config.label,
    target_id: target.id,
    enterprise_value_eur: price,
    buyer_cash_eur: buyerCash,
    senior_debt_eur: seniorDebt,
    seller_note_eur: sellerNote,
    earnout_eur: earnout,
    annual_debt_service_eur: annualDebtService,
    estimated_dscr: dscr,
    seller_cash_at_close_eur: buyerCash + seniorDebt,
    rationale: config.rationale,
    feasible:
      buyerCash <= cashAvailableEur &&
      dscr >= 1.2 &&
      earnout <= price * 0.35,
  };
}

export function buildOfferScenarios(
  target: FinanceTarget,
  cashAvailableEur: number,
): OfferScenario[] {
  return [
    createScenario(target, cashAvailableEur, {
      id: "balanced",
      label: "Balanced acquisition",
      cashShare: 0.25,
      debtShare: 0.55,
      sellerNoteShare: 0.2,
      earnoutShare: 0,
      rationale:
        "Balances buyer equity, senior debt and seller alignment while preserving post-close liquidity.",
    }),
    createScenario(target, cashAvailableEur, {
      id: "seller_aligned",
      label: "Seller-aligned transition",
      cashShare: 0.2,
      debtShare: 0.45,
      sellerNoteShare: 0.2,
      earnoutShare: 0.15,
      rationale:
        "Uses deferred consideration to align the seller with an orderly transition and verified performance.",
    }),
    createScenario(target, cashAvailableEur, {
      id: "cash_forward",
      label: "Cash-forward offer",
      cashShare: 0.3,
      debtShare: 0.62,
      sellerNoteShare: 0.08,
      earnoutShare: 0,
      rationale:
        "Maximizes cash at close when debt capacity and the buyer’s equity allow it.",
    }),
  ];
}

export function baseDscrForBusiness(
  business: Pick<
    SyntheticBusiness,
    "financial_history" | "debt_eur"
  >,
  debtCapacityEur: number,
) {
  const freeCashFlow = business.financial_history.at(-1)?.free_cash_flow_eur ?? 0;
  const service = Math.max(
    1,
    Math.min(debtCapacityEur, business.debt_eur + debtCapacityEur) *
      SENIOR_DEBT_SERVICE_FACTOR,
  );
  return Number((freeCashFlow / service).toFixed(2));
}
