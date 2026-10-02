import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/super-admin/riders: List all riders across the platform with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const role = (session?.user as any)?.role?.toUpperCase();
    if (!session?.user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const county = searchParams.get("county");
    const search = searchParams.get("search");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.verificationStatus = status;
    }
    if (county) {
      whereClause.operatingCounty = county;
    }
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { idNumber: { contains: search } },
      ];
    }

    const [riders, totalCount, statusCounts] = await Promise.all([
      prisma.riderProfile.findMany({
        where: whereClause,
        include: {
          vehicles: true,
          user: { select: { email: true, createdAt: true } },
          _count: { select: { assignments: true, earnings: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.riderProfile.count({ where: whereClause }),
      prisma.riderProfile.groupBy({
        by: ["verificationStatus"],
        _count: { id: true },
      }),
    ]);

    const counts: Record<string, number> = {};
    for (const c of statusCounts) {
      counts[c.verificationStatus] = c._count.id;
    }

    return json({
      success: true,
      totalCount,
      counts,
      riders,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_RIDERS_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load riders" }, 500);
  }
}
