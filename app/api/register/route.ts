import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/server/db/prismadb";
import { readAuthContextFromCookieHeader, resolveReturnContext, contextFromHostFallback } from "@/lib/auth/context";
import { isBusinessAdminSignupKind, normalizeHost } from "@/lib/auth/domain";
import { ensureConsumerForCompany, initialRoleForSignup } from "@/lib/auth/provision";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/auth/verification";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function originHost(req: Request): string {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    if (origin) return normalizeHost(new URL(origin).hostname);
  } catch {
    /* ignore */
  }
  return normalizeHost(req.headers.get("host"));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const callbackUrl = typeof body.callbackUrl === "string" ? body.callbackUrl : undefined;

    if (!name || !email || !password) {
      return withCors({ error: "All fields are required." }, 400);
    }

    if (body.role || body.signupType || body.tenantId || body.companyId) {
      // Client-supplied privilege fields are ignored. Context is server-resolved.
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return withCors({ error: "Email already registered." }, 409);
    }

    const cookieHeader = req.headers.get("cookie");
    let ctx = await readAuthContextFromCookieHeader(cookieHeader);
    if (!ctx && callbackUrl) {
      ctx = await resolveReturnContext(callbackUrl);
    }
    if (!ctx) {
      ctx = contextFromHostFallback(originHost(req));
    }

    const role = await initialRoleForSignup(ctx);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: false,
      },
    });

    let registeredCompanyId: string | undefined;
    if (!isBusinessAdminSignupKind(ctx.kind)) {
      const host = ctx.returnHost;
      const slug = ctx.tenantSlug;
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { domain: host },
            { domain: `www.${host}` },
            ...(slug ? [{ slug }, { domain: slug }] : []),
          ],
        },
        select: { id: true },
      });
      if (company) {
        registeredCompanyId = company.id;
        await ensureConsumerForCompany(newUser.id, company.id);
      }
    }

    const token = await createEmailVerificationToken(email);
    await sendVerificationEmail(
      email,
      token,
      ctx.returnUrl,
      registeredCompanyId
        ? { tenantType: "STORE", companyId: registeredCompanyId }
        : { tenantType: "PLATFORM" }
    ).catch(() => null);

    return withCors(
      {
        message: "User registered successfully. Verify your email before signing in.",
        requiresVerification: true,
        user: { id: newUser.id, email: newUser.email },
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return withCors({ error: "Internal Server Error." }, 500);
  }
}
