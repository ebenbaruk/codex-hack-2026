import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { syntheticBusinesses } from "./data";
import {
  canonicalize,
  defaultAcquisitionInput,
  fingerprintInput,
  generateCampaign,
} from "./engine";
import { campaignOutputSchema } from "./schema";

describe("Buyable qualification engine", () => {
  it("creates exactly 40 synthetic businesses", () => {
    expect(syntheticBusinesses).toHaveLength(40);
    expect(syntheticBusinesses.every((business) => business.name.endsWith("— Démo"))).toBe(
      true,
    );
    expect(
      syntheticBusinesses.every((business) =>
        business.evidence.every((evidence) => evidence.source.startsWith("Synthetic")),
      ),
    ).toBe(true);
    expect(
      syntheticBusinesses.every((business) =>
        business.evidence.every(
          (evidence) =>
            !evidence.detail.includes("@") &&
            !evidence.detail.includes("https://"),
        ),
      ),
    ).toBe(true);
  });

  it("returns ten schema-valid ranked targets", () => {
    const campaign = generateCampaign(defaultAcquisitionInput, {
      campaignId: "test-campaign",
      baseUrl: "https://buyable.example",
      generatedAt: "2026-07-18T00:00:00.000Z",
    });

    expect(campaignOutputSchema.safeParse(campaign).success).toBe(true);
    expect(campaign.targets).toHaveLength(10);
    expect(campaign.targets[0].qualification_score).toBeGreaterThanOrEqual(
      campaign.targets[9].qualification_score,
    );
    expect(campaign.campaign_url).toBe(
      "https://buyable.example/campaigns/test-campaign",
    );
  });

  it("keeps confidence separate from the qualification score", () => {
    const campaign = generateCampaign(defaultAcquisitionInput, {
      campaignId: "confidence-test",
      baseUrl: "https://buyable.example",
      generatedAt: "2026-07-18T00:00:00.000Z",
    });

    for (const target of campaign.targets) {
      const scoreTotal = Object.values(target.score_breakdown).reduce(
        (sum, score) => sum + score,
        0,
      );
      expect(target.qualification_score).toBe(scoreTotal);
      expect(target.confidence).toBeGreaterThanOrEqual(55);
      expect(target.confidence).toBeLessThanOrEqual(92);
    }
  });

  it("is deterministic for the same input and fixed metadata", () => {
    const options = {
      campaignId: "deterministic",
      baseUrl: "https://buyable.example",
      generatedAt: "2026-07-18T00:00:00.000Z",
    };
    expect(generateCampaign(defaultAcquisitionInput, options)).toEqual(
      generateCampaign(defaultAcquisitionInput, options),
    );
  });

  it("canonicalizes object keys before fingerprinting", () => {
    expect(canonicalize({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(fingerprintInput(defaultAcquisitionInput)).toHaveLength(64);
  });

  it("validates the safe example and output against the checked-in Ginse schemas", () => {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    const inputSchema = JSON.parse(
      readFileSync(new URL("../../../ginse/input-schema.json", import.meta.url), "utf8"),
    );
    const outputSchema = JSON.parse(
      readFileSync(new URL("../../../ginse/output-schema.json", import.meta.url), "utf8"),
    );
    const example = JSON.parse(
      readFileSync(new URL("../../../ginse/example-input.json", import.meta.url), "utf8"),
    );
    const output = generateCampaign(example, {
      campaignId: "json-schema-test",
      baseUrl: "https://buyable.example",
      generatedAt: "2026-07-18T00:00:00.000Z",
    });

    expect(ajv.validate(inputSchema, example), ajv.errorsText()).toBe(true);
    expect(ajv.validate(outputSchema, output), ajv.errorsText()).toBe(true);
  });
});
