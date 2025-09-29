// app/api/settings/company/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb"; // Use your Prisma instance

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET company settings
async function getCompanySettings(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  try {
    const companySettings = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, contactEmail: true, contactPhone: true, address: true, logoUrl: true },
    });

    if (!companySettings) return formatResponse(false, null, "Company not found", 404);

    return formatResponse(true, companySettings, "Company settings fetched successfully", 200);
  } catch (error: any) {
    console.error("Failed to fetch company settings:", error);
    return formatResponse(false, null, "Failed to fetch company settings", 500);
  }
}

// PUT update company settings
async function updateCompanySettings(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  try {
    const body = await req.json();
    const { name, contactEmail, contactPhone, address, logoUrl } = body;

    const updatedSettings = await prisma.company.update({
      where: { id: companyId },
      data: { name, contactEmail, contactPhone, address, logoUrl },
    });

    return formatResponse(true, updatedSettings, "Company settings updated successfully", 200);
  } catch (error: any) {
    console.error("Failed to update company settings:", error);
    return formatResponse(false, null, "Failed to update company settings", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getCompanySettings);
export const PUT = withApiHandler(updateCompanySettings);
