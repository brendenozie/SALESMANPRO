import type { NextApiRequest, NextApiResponse } from "next";
import dns from "dns/promises";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/**
 * GET /api/custom-domain/status?companyId=...
 *
 * Checks the live DNS status for the company's custom domain.
 * Returns whether DNS is properly pointing to your server.
 */


export const GET = withApiHandler(async (req: Request) => {
  if (req.method !== "GET") {
    return NextResponse.json(formatResponse(false,null,"Method not allowed"), { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const VPS_IP = process.env.VPS_IP || "123.45.67.89"; // ⚙️ Update with your real server IP

  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(formatResponse(false,null,"Missing companyId"), { status: 400 });
  }

  try {
    // 🔹 1. Fetch company info
    const company = await prisma.company.findUnique({
      where: { id: companyId as string },
      select: { domain: true, hasWebsite: true, slug:true },
    });

    if (!company || !company.domain) {
      return NextResponse.json(formatResponse(false,null,"No custom domain found for this company"), { status: 404 });
    }

    const domain = company.domain;

    // 🔹 2. Check DNS records for A or CNAME
    let dnsVerified = false;
    try {
      const [aRecords, cnameRecords] = await Promise.allSettled([
        dns.resolve4(domain),
        dns.resolveCname(domain),
      ]);

      // Check A records for your VPS IP
      if (aRecords.status === "fulfilled" && aRecords.value.length > 0) {
        dnsVerified = aRecords.value.includes(VPS_IP);
      }

      // Check CNAME pointing to your platform base domain
      if (!dnsVerified && cnameRecords.status === "fulfilled") {
        const base = process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.site";
        dnsVerified = cnameRecords.value.some((c) =>
          c.endsWith(base)
        );
      }
    } catch (dnsErr: any) {
      console.warn(`DNS check failed for ${domain}:`, dnsErr.message);
    }

    return NextResponse.json({
      success: true,
      domain,
      hasWebsite: company.hasWebsite,
      dnsVerified,
      slug: company.slug
    });
  } catch (error: any) {
    console.error("❌ Domain status error:", error);
    return NextResponse.json(formatResponse(false,null,"Server error checking domain status"), { status: 500 });
  }
});
