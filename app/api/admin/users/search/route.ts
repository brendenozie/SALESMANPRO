import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import  prisma  from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

  try {
    
    const cacheKey = `admin:search:${companyId || 'global'}:all`;

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

    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}