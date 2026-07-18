import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from "jose";

const DEFAULT_JWKS_URL = "https://api.ginse.ai/.well-known/jwks.json";

export class GinseAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GinseAuthorizationError";
  }
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(process.env.GINSE_JWKS_URL ?? DEFAULT_JWKS_URL),
    );
  }
  return jwks;
}

export async function verifyGinseInvocation(
  authorizationHeader: string | null,
  requestUrl: string,
) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new GinseAuthorizationError("Missing Ginse bearer token");
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    throw new GinseAuthorizationError("Missing Ginse bearer token");
  }

  try {
    const header = decodeProtectedHeader(token);
    if (header.alg !== "EdDSA" || !header.kid?.startsWith("ginse-invocation-")) {
      throw new GinseAuthorizationError("Unexpected Ginse signing key");
    }

    const issuer = process.env.GINSE_ISSUER || undefined;
    const audience =
      process.env.GINSE_AUDIENCE ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/run`
        : undefined);

    const result = await jwtVerify(token, getJwks(), {
      algorithms: ["EdDSA"],
      ...(issuer ? { issuer } : {}),
      ...(audience ? { audience } : {}),
      clockTolerance: 5,
    });

    if (!result.payload.exp || !result.payload.iat) {
      throw new GinseAuthorizationError("Ginse token is missing time bounds");
    }

    return {
      subject: result.payload.sub ?? "ginse",
      issuer: result.payload.iss,
      audience: result.payload.aud,
      requestUrl,
    };
  } catch (error) {
    if (error instanceof GinseAuthorizationError) {
      throw error;
    }
    throw new GinseAuthorizationError("Invalid or expired Ginse bearer token");
  }
}

