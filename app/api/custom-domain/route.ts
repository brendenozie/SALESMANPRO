/**
 * app/api/custom-domain/route.ts
 *
 * Custom Domain Management API.
 *
 * Supports:
 * - POST: Onboard & claim custom domain with DNS ownership verification.
 * - GET: Fetch current domain status and SSL issuance state.
 * - DELETE: Disconnect domain and invalidate cluster-wide cache.
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { z } from "zod";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import {
  registerCustomDomain,
  removeCustomDomain,
} from "@/lib/tenant/domain-service";

const DomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/, "Invalid domain format (e.g. shop.yourdomain.com)"),
  companyId: z.string().min(1, "companyId is required"),
});

const DeleteDomainSchema = z.object({
  companyId: z.string().min(1, "companyId is required"),
});

// POST: Register and verify custom domain
export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const parsed = DomainSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { domain, companyId } = parsed.data;

  try {
    const result = await registerCustomDomain({ companyId, domain });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const status = err.message.includes("already registered") ? 409 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
});

// GET: Retrieve company domain & SSL status
export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      slug: true,
      domain: true,
      hasWebsite: true,
      domainVerified: true,
      sslStatus: true,
      sslError: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    ...company,
  });
});

// DELETE: Safely remove domain from company and purge cache
export const DELETE = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  let companyId = searchParams.get("companyId");

  if (!companyId) {
    try {
      const body = await req.json();
      companyId = body.companyId;
    } catch {}
  }

  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  const result = await removeCustomDomain(companyId);
  return NextResponse.json(result, { status: 200 });
});
