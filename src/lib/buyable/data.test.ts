import { describe, expect, it } from "vitest";
import {
  businessRegions,
  createSyntheticBusinesses,
  syntheticBusinesses,
} from "./data";
import { sectors } from "./types";

const expectedRegions = [
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

const observedDates = new Set([
  "2026-06-12",
  "2026-05-27",
  "2026-05-03",
  "2026-04-18",
  "2026-03-09",
  "2026-02-21",
]);

describe("Buyable v2 synthetic data", () => {
  it("contains exactly 2,500 deterministic businesses with unique identifiers", () => {
    expect(syntheticBusinesses).toHaveLength(2_500);
    expect(new Set(syntheticBusinesses.map((business) => business.id)).size).toBe(2_500);
    expect(new Set(syntheticBusinesses.map((business) => business.name)).size).toBe(2_500);
    expect(
      syntheticBusinesses.every(
        (business) =>
          business.id.startsWith("syn-fr-") && business.name.endsWith(" — Démo"),
      ),
    ).toBe(true);
    expect(createSyntheticBusinesses()).toEqual(syntheticBusinesses);
  });

  it("covers all 13 metropolitan regions and all 10 sectors", () => {
    expect(businessRegions).toHaveLength(13);
    expect(new Set(businessRegions)).toEqual(new Set(expectedRegions));
    expect(new Set(syntheticBusinesses.map((business) => business.region))).toEqual(
      new Set(expectedRegions),
    );
    expect(new Set(syntheticBusinesses.map((business) => business.sector))).toEqual(
      new Set(sectors),
    );

    for (const region of expectedRegions) {
      expect(syntheticBusinesses.some((business) => business.region === region)).toBe(true);
    }
    for (const sector of sectors) {
      expect(syntheticBusinesses.some((business) => business.sector === sector)).toBe(true);
    }
  });

  it("provides coherent three-year financial histories", () => {
    for (const business of syntheticBusinesses) {
      const history = business.financial_history;
      expect(history.map((year) => year.year)).toEqual([2023, 2024, 2025]);
      expect(history[0].revenue_eur).toBeLessThan(history[1].revenue_eur);
      expect(history[1].revenue_eur).toBeLessThan(history[2].revenue_eur);

      for (const year of history) {
        expect(year.revenue_eur).toBeGreaterThan(0);
        expect(
          Math.abs(year.ebitda_eur - year.revenue_eur * year.ebitda_margin),
        ).toBeLessThanOrEqual(501);
        expect(
          Math.abs(
            year.free_cash_flow_eur -
              (year.ebitda_eur * 0.72 -
                year.revenue_eur * business.maintenance_capex_ratio),
          ),
        ).toBeLessThanOrEqual(501);
        expect(year.free_cash_flow_eur).toBeLessThanOrEqual(year.ebitda_eur);
      }

      expect(history[2].revenue_eur).toBe(business.revenue_estimate_eur);
      expect(history[2].ebitda_margin).toBe(business.ebitda_margin);
    }
  });

  it("uses only synthetic, non-routable contact paths", () => {
    for (const business of syntheticBusinesses) {
      expect(business.contact_paths.length).toBeGreaterThan(0);
      for (const contact of business.contact_paths) {
        expect(contact.note.toLowerCase()).toContain("synthetic");
        expect(contact.value).toContain(
          contact.channel === "business_phone" ? business.id.slice(-4).toUpperCase() : business.id,
        );
        if (contact.channel === "business_email") {
          expect(contact.value).toMatch(/@[^@]+\.invalid$/);
        }
        if (contact.channel === "contact_form") {
          expect(contact.value).toMatch(/^https:\/\/[^/]+\.example\.invalid\//);
        }
        if (contact.channel === "business_phone") {
          expect(contact.value).toMatch(/^SYNTHETIC-PHONE-/);
          expect(contact.value).not.toMatch(/^\+?\d/);
        }
      }
    }
  });

  it("keeps evidence and transition signals observational and synthetic", () => {
    const prohibitedTerms = /\b(age|aged|sale|sell|selling|for sale|retirement)\b/i;

    for (const business of syntheticBusinesses) {
      for (const evidence of business.evidence) {
        expect(evidence.source).toMatch(/^Synthetic/);
        expect(observedDates.has(evidence.observed_at)).toBe(true);
        expect(evidence.detail).not.toMatch(prohibitedTerms);
      }
      for (const signal of business.transition_signals) {
        expect(signal.source).toMatch(/^Synthetic/);
        expect(observedDates.has(signal.observed_at)).toBe(true);
        expect(signal.detail).not.toMatch(prohibitedTerms);

        if (signal.type === "long_leadership_tenure") {
          expect(business.leadership_tenure_years).toBeGreaterThanOrEqual(18);
        }
        if (signal.type === "no_visible_successor") {
          expect(business.successor_visible).toBe(false);
        }
        if (signal.type === "leadership_change") {
          expect(business.leadership_changes_3y).toBeGreaterThan(0);
        }
        if (signal.type === "public_transition_mention") {
          expect(business.public_transition_mention).toBe(true);
        }
      }
    }
  });

  it("contains no person-level fields or real-company identifiers", () => {
    const forbiddenFieldNames = new Set([
      "birth_date",
      "director_name",
      "owner_age",
      "owner_name",
      "personal_email",
      "personal_phone",
      "siren",
      "siret",
    ]);

    for (const business of syntheticBusinesses) {
      expect(
        Object.keys(business).some((field) => forbiddenFieldNames.has(field)),
      ).toBe(false);
      expect(business.name).toContain("Démo");
      expect(business.id).toMatch(/^syn-fr-/);
    }
  });
});
