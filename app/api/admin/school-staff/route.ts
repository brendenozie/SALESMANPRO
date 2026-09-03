import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "school-staff", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
  const staffMembers = await prisma.user.findMany({
      where: {
        companyId: companyId,
        staffProfile: { isNot: null }, // Only get users with a staff profile
      },
      include: {
        staffProfile: true, // Get jobTitle, department, etc.
      },
      orderBy: { createdAt: 'desc' }
    });

  try {
    if (staffMembers) {
      await cacheSet(cacheKey, staffMembers, 60);
    }
  } catch (e) {}

    return formatResponse(true, staffMembers, "Staff fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch staff", 500);
  }
}