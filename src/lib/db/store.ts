import { randomUUID } from "node:crypto";
import { getSql, hasDatabase } from "./client";
import { normalizeCampaignOutput } from "@/lib/buyable/engine";
import type { AcquisitionInput, CampaignOutput } from "@/lib/buyable/types";

export type StoredRun = {
  idempotencyKey: string;
  fingerprint: string;
  operationId: string;
  status: "processing" | "succeeded";
  input: AcquisitionInput;
  output: CampaignOutput | null;
};

export type ClaimResult =
  | { kind: "claimed"; operationId: string }
  | { kind: "replay"; run: StoredRun }
  | { kind: "processing"; run: StoredRun }
  | { kind: "conflict"; run: StoredRun };

export interface BuyableStore {
  claimRun(
    idempotencyKey: string,
    fingerprint: string,
    input: AcquisitionInput,
  ): Promise<ClaimResult>;
  completeRun(
    idempotencyKey: string,
    input: AcquisitionInput,
    output: CampaignOutput,
  ): Promise<void>;
  getRunByOperationId(operationId: string): Promise<StoredRun | null>;
  getCampaign(id: string): Promise<CampaignOutput | null>;
}

type GlobalStore = {
  runs: Map<string, StoredRun>;
  campaigns: Map<string, CampaignOutput>;
};

const globalForStore = globalThis as typeof globalThis & {
  __buyableStore?: GlobalStore;
};

function memoryState(): GlobalStore {
  if (!globalForStore.__buyableStore) {
    globalForStore.__buyableStore = {
      runs: new Map(),
      campaigns: new Map(),
    };
  }
  return globalForStore.__buyableStore;
}

class MemoryBuyableStore implements BuyableStore {
  async claimRun(
    idempotencyKey: string,
    fingerprint: string,
    input: AcquisitionInput,
  ): Promise<ClaimResult> {
    const state = memoryState();
    const existing = state.runs.get(idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return { kind: "conflict", run: existing };
      }
      return existing.status === "succeeded"
        ? { kind: "replay", run: existing }
        : { kind: "processing", run: existing };
    }

    const operationId = `buyable_${randomUUID().replaceAll("-", "")}`;
    state.runs.set(idempotencyKey, {
      idempotencyKey,
      fingerprint,
      operationId,
      status: "processing",
      input,
      output: null,
    });
    return { kind: "claimed", operationId };
  }

  async completeRun(
    idempotencyKey: string,
    input: AcquisitionInput,
    output: CampaignOutput,
  ) {
    const state = memoryState();
    const run = state.runs.get(idempotencyKey);
    if (!run) {
      throw new Error("Cannot complete a run that has not been claimed");
    }
    state.campaigns.set(output.campaign_id, output);
    state.runs.set(idempotencyKey, {
      ...run,
      input,
      output,
      status: "succeeded",
    });
  }

  async getRunByOperationId(operationId: string) {
    return (
      Array.from(memoryState().runs.values()).find(
        (run) => run.operationId === operationId,
      ) ?? null
    );
  }

  async getCampaign(id: string) {
    const output = memoryState().campaigns.get(id);
    return output ? normalizeCampaignOutput(output) : null;
  }
}

type NeonRunRow = {
  idempotency_key: string;
  fingerprint: string;
  operation_id: string;
  status: "processing" | "succeeded";
  input: AcquisitionInput;
  output: CampaignOutput | null;
};

function mapRun(row: NeonRunRow): StoredRun {
  return {
    idempotencyKey: row.idempotency_key,
    fingerprint: row.fingerprint,
    operationId: row.operation_id,
    status: row.status,
    input: row.input,
    output: row.output,
  };
}

class NeonBuyableStore implements BuyableStore {
  async claimRun(
    idempotencyKey: string,
    fingerprint: string,
    input: AcquisitionInput,
  ): Promise<ClaimResult> {
    const sql = getSql();
    const operationId = `buyable_${randomUUID().replaceAll("-", "")}`;
    const inserted = (await sql`
      INSERT INTO ginse_runs (
        idempotency_key, fingerprint, operation_id, status, input
      )
      VALUES (
        ${idempotencyKey}, ${fingerprint}, ${operationId}, 'processing',
        ${JSON.stringify(input)}::jsonb
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING idempotency_key, fingerprint, operation_id, status, input, output
    `) as NeonRunRow[];

    if (inserted.length === 1) {
      return { kind: "claimed", operationId };
    }

    const rows = (await sql`
      SELECT idempotency_key, fingerprint, operation_id, status, input, output
      FROM ginse_runs
      WHERE idempotency_key = ${idempotencyKey}
      LIMIT 1
    `) as NeonRunRow[];
    const run = mapRun(rows[0]);

    if (run.fingerprint !== fingerprint) {
      return { kind: "conflict", run };
    }
    return run.status === "succeeded"
      ? { kind: "replay", run }
      : { kind: "processing", run };
  }

  async completeRun(
    idempotencyKey: string,
    input: AcquisitionInput,
    output: CampaignOutput,
  ) {
    const sql = getSql();
    await sql`
      INSERT INTO campaigns (id, input, output, synthetic)
      VALUES (
        ${output.campaign_id},
        ${JSON.stringify(input)}::jsonb,
        ${JSON.stringify(output)}::jsonb,
        true
      )
      ON CONFLICT (id) DO UPDATE SET output = EXCLUDED.output
    `;
    await sql`
      UPDATE ginse_runs
      SET
        status = 'succeeded',
        output = ${JSON.stringify(output)}::jsonb,
        completed_at = NOW()
      WHERE idempotency_key = ${idempotencyKey}
    `;
  }

  async getRunByOperationId(operationId: string) {
    const sql = getSql();
    const rows = (await sql`
      SELECT idempotency_key, fingerprint, operation_id, status, input, output
      FROM ginse_runs
      WHERE operation_id = ${operationId}
      LIMIT 1
    `) as NeonRunRow[];
    return rows.length ? mapRun(rows[0]) : null;
  }

  async getCampaign(id: string) {
    const sql = getSql();
    const rows = (await sql`
      SELECT input, output
      FROM campaigns
      WHERE id = ${id}
      LIMIT 1
    `) as Array<{ input: unknown; output: unknown }>;
    return rows[0]
      ? normalizeCampaignOutput(rows[0].output, rows[0].input)
      : null;
  }
}

let store: BuyableStore | null = null;

export function getBuyableStore(): BuyableStore {
  if (!store) {
    if (process.env.VERCEL && !hasDatabase()) {
      throw new Error(
        "DATABASE_URL is required on Vercel to guarantee durable Ginse idempotency",
      );
    }
    store = hasDatabase() ? new NeonBuyableStore() : new MemoryBuyableStore();
  }
  return store;
}
