import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

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
    return NextResponse.json({ data: vendors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}