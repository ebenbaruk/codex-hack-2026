import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { acquisitionInputSchema } from "@/lib/buyable/schema";
import { fingerprintInput, generateCampaign } from "@/lib/buyable/engine";
import { getBuyableStore } from "@/lib/db/store";
import {
  GinseAuthorizationError,
  verifyGinseInvocation,
} from "@/lib/ginse/auth";

export const runtime = "nodejs";
export const maxDuration = 15;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    await verifyGinseInvocation(request.headers.get("authorization"), request.url);

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey || idempotencyKey.length > 200) {
      return json(
        {
          error: "A valid Idempotency-Key header is required.",
        },
        400,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const rawInput =
      body && typeof body === "object" && "input" in body ? body.input : body;
    const input = acquisitionInputSchema.parse(rawInput);
    const fingerprint = fingerprintInput(input);
    const store = getBuyableStore();
    const claim = await store.claimRun(idempotencyKey, fingerprint, input);

    if (claim.kind === "conflict") {
      return json(
        {
          error:
            "Idempotency-Key was already used with a different request fingerprint.",
          provider_operation_id: claim.run.operationId,
        },
        409,
      );
    }

    if (claim.kind === "replay") {
      return json({
        status: "succeeded",
        provider_operation_id: claim.run.operationId,
        replayed: true,
        output: claim.run.output,
      });
    }

    if (claim.kind === "processing") {
      return json(
        {
          status: "pending",
          provider_operation_id: claim.run.operationId,
          replayed: true,
          status_url: `${new URL(request.url).origin}/status/${claim.run.operationId}`,
        },
        202,
      );
    }

    const campaignId = randomUUID();
    const output = generateCampaign(input, {
      campaignId,
      baseUrl: new URL(request.url).origin,
    });
    await store.completeRun(idempotencyKey, input, output);

    return json({
      status: "succeeded",
      provider_operation_id: claim.operationId,
      replayed: false,
      output,
    });
  } catch (error) {
    if (error instanceof GinseAuthorizationError) {
      return json({ error: error.message }, 401);
    }
    if (error instanceof ZodError) {
      return json(
        {
          error: "Input does not match the advertised schema.",
          issues: error.issues,
        },
        400,
      );
    }
    console.error("Buyable run failed", error);
    return json(
      {
        error: "Buyable could not complete the campaign.",
        request_id: randomUUID(),
      },
      500,
    );
  }
}

