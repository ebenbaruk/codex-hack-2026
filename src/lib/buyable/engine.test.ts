import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  canonicalize,
  defaultAcquisitionInput,
  fingerprintInput,
  generateCampaign,
} from "./engine";
import { campaignOutputSchema } from "./schema";
import { simulateConvictionRanking } from "./simulation";

const fixedOptions = {
  campaignId: "test-campaign",
  baseUrl: "https://buyable.example",
  generatedAt: "2026-07-18T00:00:00.000Z",
};

describe("Buyable acquisition intelligence engine", () => {
  it("returns a schema-valid market funnel and ten ranked conviction targets", () => {
    const campaign = generateCampaign(defaultAcquisitionInput, fixedOptions);
    const funnel = campaign.market_funnel;

    expect(campaignOutputSchema.safeParse(campaign).success).toBe(true);
    expect(campaign.schema_version).toBe("2");
    expect(campaign.targets).toHaveLength(10);
    expect(campaign.conviction_targets).toEqual(campaign.targets);
    expect(funnel.universe_scanned).toBe(2_500);
    expect(funnel.universe_scanned).toBeGreaterThanOrEqual(funnel.thesis_compatible);
    expect(funnel.thesis_compatible).toBeGreaterThanOrEqual(
      funnel.economically_solid,
    );
    expect(funnel.economically_solid).toBeGreaterThanOrEqual(funnel.financeable);
    expect(funnel.financeable).toBeGreaterThanOrEqual(
      funnel.transition_relevant,
    );
    expect(funnel.conviction_list).toBe(10);
    expect(campaign.targets[0].conviction_score).toBeGreaterThanOrEqual(
      campaign.targets[9].conviction_score,
    );
    expect(campaign.targets[0].city).toBe("Lyon");
    expect(new Set(campaign.targets.map((target) => target.sector))).toEqual(
      new Set(defaultAcquisitionInput.sectors),
    );
    expect(
      new Set(
        campaign.targets.map((target) =>
          target.name.replace(/\s\d{4} — Démo$/, ""),
        ),
      ).size,
    ).toBe(10);
    expect(campaign.campaign_url).toBe(
      "https://buyable.example/campaigns/test-campaign",
    );
  });

  it("keeps confidence separate from the transparent 100-point score", () => {
    const campaign = generateCampaign(defaultAcquisitionInput, fixedOptions);

    for (const target of campaign.targets) {
      const scoreTotal = Object.values(target.score_breakdown).reduce(
        (sum, score) => sum + score,
        0,
      );
      expect(target.conviction_score).toBe(scoreTotal);
      expect(target.qualification_score).toBe(scoreTotal);
      expect(target.confidence).toBeGreaterThanOrEqual(60);
      expect(target.confidence).toBeLessThanOrEqual(96);
      expect(target.rank_explanation.length).toBeGreaterThan(30);
    }
  });

  it("changes financeability and ranking inputs when buyer cash changes", () => {
    const campaign = generateCampaign(defaultAcquisitionInput, fixedOptions);
    const lowCash = simulateConvictionRanking(campaign.targets, 75_000);
    const highCash = simulateConvictionRanking(campaign.targets, 750_000);

    expect(highCash[0].score_breakdown.financeability).toBeGreaterThanOrEqual(
      lowCash[0].score_breakdown.financeability,
    );
    expect(
      highCash.reduce(
        (sum, target) => sum + target.score_breakdown.financeability,
        0,
      ),
    ).toBeGreaterThan(
      lowCash.reduce(
        (sum, target) => sum + target.score_breakdown.financeability,
        0,
      ),
    );
    expect(
      lowCash.some((target) => target.financeability.equity_gap_eur > 0),
    ).toBe(true);
  });

  it("builds coherent offer scenarios and a complete acquisition Deal Pack", () => {
    const campaign = generateCampaign(defaultAcquisitionInput, fixedOptions);

    expect(campaign.offer_scenarios).toHaveLength(3);
    for (const scenario of campaign.offer_scenarios) {
      expect(
        scenario.buyer_cash_eur +
          scenario.senior_debt_eur +
          scenario.seller_note_eur +
          scenario.earnout_eur,
      ).toBe(scenario.enterprise_value_eur);
      expect(scenario.estimated_dscr).toBeGreaterThan(0);
      expect(scenario.buyer_cash_eur).toBeLessThanOrEqual(
        defaultAcquisitionInput.cash_available_eur,
      );
    }

    expect(campaign.generated_artifacts).toHaveLength(7);
    expect(campaign.top_acquisition_case.information_request.length).toBeGreaterThanOrEqual(3);
    expect(campaign.top_acquisition_case.hundred_day_plan).toHaveLength(3);
    expect(campaign.top_acquisition_case.loi_draft).toContain("NON-BINDING");
    expect(campaign.outreach_packet.email_body.toLowerCase()).toContain(
      "je ne présume pas de vos intentions",
    );
  });

  it("is deterministic for the same input and fixed metadata", () => {
    expect(generateCampaign(defaultAcquisitionInput, fixedOptions)).toEqual(
      generateCampaign(defaultAcquisitionInput, fixedOptions),
    );
  });

  it("canonicalizes object keys before fingerprinting", () => {
    expect(canonicalize({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(fingerprintInput(defaultAcquisitionInput)).toHaveLength(64);
  });

  it("validates the example and output against the checked-in Ginse schemas", () => {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    const inputSchema = JSON.parse(
      readFileSync(
        new URL("../../../ginse/input-schema.json", import.meta.url),
        "utf8",
      ),
    );
    const outputSchema = JSON.parse(
      readFileSync(
        new URL("../../../ginse/output-schema.json", import.meta.url),
        "utf8",
      ),
    );
    const example = JSON.parse(
      readFileSync(
        new URL("../../../ginse/example-input.json", import.meta.url),
        "utf8",
      ),
    );
    const output = generateCampaign(example, {
      ...fixedOptions,
      campaignId: "json-schema-test",
    });

    expect(ajv.validate(inputSchema, example), ajv.errorsText()).toBe(true);
    expect(ajv.validate(outputSchema, output), ajv.errorsText()).toBe(true);
  });
});
