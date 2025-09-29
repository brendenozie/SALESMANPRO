// app/api/custom-domain/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveCname, resolveTxt } from "dns/promises";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";

export async function POST(req: NextRequest) {
  // 1) Verify authentication
  const auth = await verifyAuth(req);
  
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  const { domain } = await req.json();

  // 2) Input validation
  if (typeof domain !== "string" || !domain.includes(".")) {
    return formatResponse(false, null, "Invalid domain format", 400);
  }

  // 3) DNS lookup: check for CNAME or TXT record
  const expectedTarget = "app.your-production-domain.com";
  let records: string[] = [];

  try {
    records = await resolveCname(domain);
  } catch {
    try {
      const txt = await resolveTxt(domain);
      records = txt.flat();
    } catch {
      return formatResponse(false, null, `No CNAME or TXT record found for ${domain}`, 400);
    }
  }

  if (!records.includes(expectedTarget)) {
    return formatResponse(
      false,
      null,
      `DNS must point to ${expectedTarget}. Found: ${records.join(", ")}`,
      400
    );
  }

  const user = await auth.user || '';

  if (!user) { 
    return formatResponse(false, null, "User not found", 404);
  }

  // 4) Persist on the company record (assuming auth.userId maps to Company.userId)
  const company = await prisma.company.updateMany({
    where: { userId: user.id },
    data: { domain },
  });

  if (company.count === 0) {
    return formatResponse(false, null, "Company not found", 404);
  }

  return formatResponse(true, { domain }, `${domain} connected successfully!`);
}
