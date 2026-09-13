import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { ROLES } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req);

    const { searchParams } = new URL(req.url);
    const targetAudience = searchParams.get("targetAudience") || "ALL";
    const targetRole = searchParams.get("targetRole") as ROLES | null;
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";

    // Base filter: active, non-deleted users with a valid email
    const baseWhere: any = {
      email: { not: "" },
      deletedAt: null,
      status: { not: "SUSPENDED" },
    };

    if (verifiedOnly) {
      baseWhere.emailVerified = true;
    }

    // Role-specific filter
    let audienceWhere: any = { ...baseWhere };

    if (targetAudience === "STORE_ADMINS") {
      audienceWhere.OR = [
        { role: "ADMIN" },
        { companyId: { not: null } },
      ];
    } else if (targetAudience === "ROLE" && targetRole) {
      audienceWhere.role = targetRole;
    }

    // Parallel fetch: matching count, sample recipients, and role distribution
    const [matchingCount, sampleUsers, roleGroups] = await Promise.all([
      prisma.user.count({ where: audienceWhere }),
      prisma.user.findMany({
        where: audienceWhere,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.groupBy({
        by: ["role"],
        where: {
          email: { not: "" },
          deletedAt: null,
          status: { not: "SUSPENDED" },
        },
        _count: { id: true },
      }),
    ]);

    const roleBreakdown: Record<string, number> = {};
    for (const group of roleGroups) {
      if (group.role) {
        roleBreakdown[group.role] = group._count.id;
      }
    }

    return formatResponse(
      true,
      {
        matchingCount,
        sampleUsers,
        roleBreakdown,
        availableRoles: Object.keys(roleBreakdown).sort(),
      },
      "Audience count resolved successfully",
      200
    );
  } catch (err: any) {
    console.error("[SuperAdmin Email Audience] GET error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Failed to calculate audience count",
      err.statusCode || 500
    );
  }
}
