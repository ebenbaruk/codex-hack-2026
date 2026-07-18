import { calculateFinanceabilityScore } from "./finance";
import type { QualifiedTarget } from "./types";

export function simulateConvictionRanking(
  targets: QualifiedTarget[],
  cashAvailableEur: number,
): QualifiedTarget[] {
  return targets
    .map((target) => {
      const finance = calculateFinanceabilityScore({
        valuationMidpointEur: target.valuation_range_eur.midpoint,
        freeCashFlowEur: target.estimated_financials.free_cash_flow_eur,
        existingDebtEur: target.estimated_financials.debt_eur,
        cashAvailableEur,
      });
      const score =
        target.conviction_score -
        target.score_breakdown.financeability +
        finance.score;
      const { score: financeabilityScore, ...financeability } = finance;

      return {
        ...target,
        conviction_score: score,
        qualification_score: score,
        score_breakdown: {
          ...target.score_breakdown,
          financeability: financeabilityScore,
        },
        financeability: {
          ...financeability,
          base_dscr: target.financeability.base_dscr,
        },
      };
    })
    .sort((a, b) => {
      if (b.conviction_score !== a.conviction_score) {
        return b.conviction_score - a.conviction_score;
      }
      return b.confidence - a.confidence;
    });
}
