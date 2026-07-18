import { getBuyableStore } from "@/lib/db/store";
import {
  GinseAuthorizationError,
  verifyGinseInvocation,
} from "@/lib/ginse/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ operationId: string }> },
) {
  try {
    await verifyGinseInvocation(request.headers.get("authorization"), request.url);
    const { operationId } = await context.params;
    const run = await getBuyableStore().getRunByOperationId(operationId);
    if (!run) {
      return Response.json({ error: "Operation not found" }, { status: 404 });
    }

    if (run.status === "succeeded") {
      return Response.json({
        status: "succeeded",
        provider_operation_id: run.operationId,
        output: run.output,
      });
    }

    return Response.json(
      {
        status: "pending",
        provider_operation_id: run.operationId,
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof GinseAuthorizationError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    return Response.json({ error: "Unable to read operation" }, { status: 500 });
  }
}
