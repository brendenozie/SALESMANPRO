import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import  prisma  from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

  try {
    
    const cacheKey = buildTenantCacheKey(companyId, "search", { query });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const users = await prisma.user.findMany({
      where: {
        companyId: companyId,
        staffProfile: { is: null }, // Only users who AREN'T staff yet
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5, // Limit results for performance
    });

  try {
    if (users) {
      await cacheSet(cacheKey, users, 60);
    }
  } catch (e) {}

  try {    
    await cacheSet(cacheKey, users, 60);
  } catch (e) {
    console.error("Error caching search results:", e);
  }
    return formatResponse(true, users);
  } catch (error) {
    return formatResponse(false, null, "Search failed", 500);
  }
}