import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const department = searchParams.get("department");

  if (!companyId || !department) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    
    const cacheKey = `admin:roster:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const roster = await prisma.staffProfile.findMany({
      where: {
        companyId,
        department: department,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { jobTitle: 'asc' }
    });

  try {
    if (roster) {
      await cacheSet(cacheKey, { data: roster }, 60);
    }
  } catch (e) {}

    return NextResponse.json({ data: roster });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch roster" }, { status: 500 });
  }
}