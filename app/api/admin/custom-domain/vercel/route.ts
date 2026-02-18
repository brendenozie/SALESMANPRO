import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { z } from "zod";





const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  throw new Error("Missing Vercel environment configuration");
}





const domainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
});





export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);

  if (!auth.success || !auth.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const company = await prisma.company.findFirst({
    where: { userId: auth.user.id },
    select: { domain: true, domainVerified: true },
  });

  if (!company?.domain) {
    return formatResponse(
      false,
      null,
      "No domain configured for this account",
      404
    );
  }

  try {
    const vercelResponse = await fetch(
      `https://api.vercel.com/v6/domains/${company.domain}/config${
        VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    );

    if (vercelResponse.status === 404) {
      return formatResponse(
        false,
        null,
        "Domain not found on infrastructure provider",
        404
      );
    }

    if (!vercelResponse.ok) {
      return formatResponse(
        false,
        null,
        "Failed to retrieve domain status",
        vercelResponse.status
      );
    }

    const data = await vercelResponse.json();

    

    const isActive = data.verified && !data.misconfigured;

    // Sync DB only if state changed
    if (isActive && !company.domainVerified) {
      await prisma.company.updateMany({
        where: { userId: auth.user.id },
        data: { domainVerified: true },
      });
    }

    return formatResponse(
      true,
      {
        domain: company.domain,
        status: isActive ? "ACTIVE" : "PENDING",
        verified: data.verified,
        misconfigured: data.misconfigured,
        dnsRecords: data.records ?? [],
      },
      "Status retrieved"
    );
  } catch (error) {
    console.error("Domain Status Poll Error:", error);
    return formatResponse(
      false,
      null,
      "Failed to poll domain status",
      500
    );
  }
}





export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);

  if (!auth.success || !auth.user?.id) {
    return formatResponse(false, null, "Unauthorized", 401);
  }

  const body = await req.json();
  const parsed = domainSchema.safeParse(body);

  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const cleanDomain = parsed.data.domain.trim().toLowerCase();

  try {
    // Prevent duplicate domain usage
    const existing = await prisma.company.findFirst({
      where: { domain: cleanDomain },
      select: { id: true },
    });

    if (existing) {
      return formatResponse(
        false,
        null,
        "Domain already in use by another account",
        409
      );
    }

    

    const vercelResponse = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains${
        VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
      }`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanDomain }),
      }
    );

    const vercelData = await vercelResponse.json();

    if (!vercelResponse.ok) {
      return formatResponse(
        false,
        vercelData,
        vercelData.error?.message || "Vercel integration failed",
        vercelResponse.status
      );
    }

    

    await prisma.company.updateMany({
      where: { userId: auth.user.id },
      data: {
        domain: cleanDomain,
        domainVerified: Boolean(vercelData.verified),
      },
    });

    
    try { await cacheDel(`admin:vercel:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(
      true,
      {
        domain: cleanDomain,
        verified: Boolean(vercelData.verified),
        requiredDnsConfig: vercelData.verification ?? [],
      },
      "Domain added. SSL provisioning initiated."
    );
  } catch (error) {
    console.error("Custom Domain Provision Error:", error);
    return formatResponse(
      false,
      null,
      "Internal server error during provisioning",
      500
    );
  }
}
