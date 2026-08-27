import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    
  const cacheKey = `admin:vendors:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const vendors = await prisma.hostelVendor.findMany({
      where: { companyId },
      include: {
        _count: { select: { items: true } } // Count items supplied by this vendor
      }
    });

  try {
    if (vendors) {
      await cacheSet(cacheKey, vendors, 60);
    }
  } catch (e) {}

    return formatResponse(true, vendors, "Vendors fetched successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch vendors", 500);
  }
}