import { randomUUID } from "crypto";
import { encode, decode } from "next-auth/jwt";
import { cacheGet, cacheSet } from "@/lib/cache";
import { isAllowedReturnUrl } from "./context";
import { HUB_URL, parseAbsoluteUrl } from "./domain";

const HANDOVER_MAX_AGE = 120;
const PURPOSE = "cross-domain-handover";

export async function createHandoverToken(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  emailVerified?: boolean | null;
  companyId?: string | null;
  hasTenantAccess?: boolean | null;
}) {
  const jti = randomUUID();
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
    },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: HANDOVER_MAX_AGE,
  });
  return { token, jti };
}

export async function consumeHandoverToken(raw: string) {
  const decoded = await decode({
    token: raw,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!decoded || !decoded.email || !decoded.id) return null;
  const purpose = (decoded as { purpose?: string }).purpose;
  const jti = (decoded as { jti?: string }).jti;
  if (purpose !== PURPOSE) return null;
  if (!jti) return null;

  const replayKey = `handover:jti:${jti}`;
  const used = await cacheGet(replayKey);
  if (used) return null;
  await cacheSet(replayKey, true, HANDOVER_MAX_AGE + 30);

  return decoded;
}

export async function safeHandoverTarget(rawTarget: string | null | undefined): Promise<URL | null> {
  const fallback = new URL(HUB_URL);
  const candidate = rawTarget ? parseAbsoluteUrl(rawTarget) : fallback;
  if (!candidate) return null;
  const allowed = await isAllowedReturnUrl(candidate.toString());
  if (!allowed) return null;
  return candidate;
}
