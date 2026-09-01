import type { SignupOriginKind } from "./domain";

export const AUTH_CONTEXT_COOKIE = "sp.auth.ctx";
export const AUTH_CONTEXT_MAX_AGE_SECONDS = 20 * 60;

export type AuthFlowContext = {
  kind: SignupOriginKind;
  returnHost: string;
  returnUrl: string;
  tenantSlug: string | null;
  issuedAt: number;
};

function secret(): string {
  return (
    process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-auth-context"
  );
}

// 1. Replaced Node.js createHmac with Web Crypto API (async)
async function sign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(secret());
  const data = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return Buffer.from(signatureBuffer).toString("base64url");
}

// 2. Replaced Node.js timingSafeEqual with a custom edge-compatible implementation
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let mismatch = 0;
  for (let i = 0; i < a.byteLength; i++) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

export async function encodeAuthContext(ctx: AuthFlowContext): Promise<string> {
  const payload = Buffer.from(JSON.stringify(ctx), "utf8").toString(
    "base64url",
  );
  const signature = await sign(payload); // Now requires await
  return `${payload}.${signature}`;
}

export async function decodeAuthContext(
  value: string | null | undefined,
): Promise<AuthFlowContext | null> {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = await sign(payload); // Now requires await

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (!timingSafeEqual(a, b)) return null;

  try {
    const ctx = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AuthFlowContext;
    if (!ctx?.returnHost || !ctx?.kind || !ctx?.issuedAt) return null;
    if (Date.now() - ctx.issuedAt > AUTH_CONTEXT_MAX_AGE_SECONDS * 1000)
      return null;
    return ctx;
  } catch {
    return null;
  }
}

export async function readAuthContextFromCookieHeader(
  cookieHeader: string | null | undefined,
): Promise<AuthFlowContext | null> {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${AUTH_CONTEXT_COOKIE}=`));
  if (!match) return null;

  return await decodeAuthContext(
    decodeURIComponent(match.slice(AUTH_CONTEXT_COOKIE.length + 1)),
  );
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_CONTEXT_MAX_AGE_SECONDS,
  };
}
