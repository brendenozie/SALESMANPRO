import { randomUUID } from "crypto";
import { encode, decode } from "next-auth/jwt";
import { cacheGet, cacheSet } from "../cache";
import { isAllowedReturnUrl } from "./context";
import { HUB_URL, normalizeHost, parseAbsoluteUrl } from "./domain";

const HANDOVER_MAX_AGE = 300; // 5 minutes for mobile deep links and app switching
const PURPOSE = "cross-domain-handover";

function handoverSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "default-salesmanpro-handover-secret-32-chars-min"
  );
}

export async function createHandoverToken(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  emailVerified?: boolean | null;
  companyId?: string | null;
  hasTenantAccess?: boolean | null;
}, options?: { audienceHost?: string | null }) {
  const jti = randomUUID();
  const audienceHost = normalizeHost(options?.audienceHost || "");
  const token = await encode({
    token: {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
      companyId: user.companyId,
      hasTenantAccess: user.hasTenantAccess,
      purpose: PURPOSE,
      jti,
      aud: audienceHost || undefined,
    },
    secret: handoverSecret(),
    maxAge: HANDOVER_MAX_AGE,
  });
  return { token, jti };
}

export function matchesHandoverAudience(
  tokenAudience: string | undefined,
  expectedHost: string | null | undefined,
) {
  if (!tokenAudience) return true;
  const normalizedAud = normalizeHost(tokenAudience);
  const expected = normalizeHost(expectedHost || "");

  // 1. Exact match between token audience and consuming host
  if (expected && normalizedAud === expected) return true;

  // 2. Native client applications (Android and Desktop apps) exchanging tokens at API endpoints
  if (
    normalizedAud === "site.salesmanpro.android" ||
    normalizedAud === "salesmanpro.android" ||
    normalizedAud === "site.salesmanpro.desktop" ||
    normalizedAud === "salesmanpro.desktop"
  ) {
    return true;
  }

  return false;
}

export async function consumeHandoverToken(raw: string, expectedHost?: string | null) {
  const decoded = await decode({
    token: raw,
    secret: handoverSecret(),
  });

  if (!decoded || !decoded.email || !decoded.id) return null;
  const purpose = (decoded as { purpose?: string }).purpose;
  const jti = (decoded as { jti?: string }).jti;
  const audience = (decoded as { aud?: string }).aud;
  if (purpose !== PURPOSE) return null;
  if (!jti) return null;
  if (!matchesHandoverAudience(audience, expectedHost)) return null;

  const replayKey = `handover:jti:${jti}`;
  const used = await cacheGet(replayKey);
  if (used) return null;
  await cacheSet(replayKey, true, HANDOVER_MAX_AGE + 30);

  return decoded;
}

export async function safeHandoverTarget(rawTarget: string | null | undefined): Promise<URL | null> {
  const fallback = new URL(`${HUB_URL}/dashboards`);
  let candidate = rawTarget ? parseAbsoluteUrl(rawTarget) : fallback;
  if (!candidate) return null;

  // Prevent self-referencing handover loops to the auth domain
  if (normalizeHost(candidate.hostname) === "auth.salesmanpro.site") {
    candidate = fallback;
  }

  const allowed = await isAllowedReturnUrl(candidate.toString());
  if (!allowed) return null;
  return candidate;
}
