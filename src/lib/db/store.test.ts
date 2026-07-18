import { describe, expect, it } from "vitest";
import { defaultAcquisitionInput, generateCampaign } from "@/lib/buyable/engine";
import { getBuyableStore } from "./store";

describe("Buyable run store", () => {
  it("claims, completes, and replays an exact idempotent request", async () => {
    const key = `test-${crypto.randomUUID()}`;
    const store = getBuyableStore();
    const first = await store.claimRun(key, "fingerprint-a", defaultAcquisitionInput);
    expect(first.kind).toBe("claimed");
    if (first.kind !== "claimed") throw new Error("Expected a new claim");

    const output = generateCampaign(defaultAcquisitionInput, {
      campaignId: `campaign-${crypto.randomUUID()}`,
      baseUrl: "https://buyable.example",
      generatedAt: "2026-07-18T00:00:00.000Z",
    });
    await store.completeRun(key, defaultAcquisitionInput, output);

    const replay = await store.claimRun(key, "fingerprint-a", defaultAcquisitionInput);
    expect(replay.kind).toBe("replay");
    if (replay.kind === "replay") {
      expect(replay.run.output).toEqual(output);
      expect(replay.run.operationId).toBe(first.operationId);
    }
  });

  it("rejects reuse with a different fingerprint", async () => {
    const key = `test-${crypto.randomUUID()}`;
    const store = getBuyableStore();
    await store.claimRun(key, "fingerprint-a", defaultAcquisitionInput);
    const conflict = await store.claimRun(
      key,
      "fingerprint-b",
      defaultAcquisitionInput,
    );
    expect(conflict.kind).toBe("conflict");
  });

  it("returns processing for a concurrent exact request", async () => {
    const key = `test-${crypto.randomUUID()}`;
    const store = getBuyableStore();
    await store.claimRun(key, "fingerprint-a", defaultAcquisitionInput);
    const duplicate = await store.claimRun(
      key,
      "fingerprint-a",
      defaultAcquisitionInput,
    );
    expect(duplicate.kind).toBe("processing");
  });
});

