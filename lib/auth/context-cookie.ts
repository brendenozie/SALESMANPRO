import { createHmac, timingSafeEqual } from "crypto";
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
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-auth-context";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeAuthContext(ctx: AuthFlowContext): string {
  const payload = Buffer.from(JSON.stringify(ctx), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeAuthContext(value: string | null | undefined): AuthFlowContext | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const ctx = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthFlowContext;
    if (!ctx?.returnHost || !ctx?.kind || !ctx?.issuedAt) return null;
    if (Date.now() - ctx.issuedAt > AUTH_CONTEXT_MAX_AGE_SECONDS * 1000) return null;
    return ctx;
  } catch {
    return null;
  }
}

export function readAuthContextFromCookieHeader(cookieHeader: string | null | undefined): AuthFlowContext | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${AUTH_CONTEXT_COOKIE}=`));
  if (!match) return null;
  return decodeAuthContext(decodeURIComponent(match.slice(AUTH_CONTEXT_COOKIE.length + 1)));
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
