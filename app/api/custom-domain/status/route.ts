import type { NextApiRequest, NextApiResponse } from "next";
import dns from "dns/promises";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET /api/custom-domain/status?companyId=...
 *
 * Checks the live DNS status for the company's custom domain.
 * Returns whether DNS is properly pointing to your server.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json(formatResponse(false,null,"Method not allowed"));
  }

  const { companyId } = req.query;
  const VPS_IP = process.env.VPS_IP || "123.45.67.89"; // ⚙️ Update with your real server IP

  if (!companyId) {
    return res.status(400).json(formatResponse(false,null,"Missing companyId"));
  }

  try {
    // 🔹 1. Fetch company info
    const company = await prisma.company.findUnique({
      where: { id: companyId as string },
      select: { domain: true, hasWebsite: true },
    });

    if (!company || !company.domain) {
      return res
        .status(404)
        .json(formatResponse(false,null,"No custom domain found for this company"));
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

    return res.status(200).json({
      success: true,
      domain,
      hasWebsite: company.hasWebsite,
      dnsVerified,
    });
  } catch (error: any) {
    console.error("❌ Domain status error:", error);
    return res
      .status(500)
      .json(formatResponse(false,null,"Server error checking domain status"));
  }
}
