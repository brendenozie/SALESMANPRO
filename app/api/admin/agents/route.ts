import { cacheGet, cacheSet, cacheDel, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

// =====================
// GET /api/sales-agents
// =====================
export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "agents", {});


  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return formatResponse(
        true,
        cached,
        "Fetched agents successfully (cached)",
        200,
      );
    }
  } catch (e) {}

  try {
    // Single-pass query optimizations pulling records, relationship arrays, and counts together
    const users = await prisma.user.findMany({
      where: {
        role: "AGENT",
        salesAgentProfile: {
          some: { companyId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true,
        salesAgentProfile: {
          where: { companyId },
          take: 1, // Only fetch the matching single context profile row
          select: {
            id: true,
            loginCode: true,
            phoneNumber: true,
            specialties: true,
            regions: true,
            isActive: true,
            createdAt: true,
            transactions: {
              select: { amount: true, date: true },
              orderBy: { date: "desc" },
              take: 1,
            },
            commissions: {
              select: { commissionEarned: true, createdAt: true, status: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            _count: {
              select: {
                transactions: true,
                commissions: true,
                clients: true,
              },
            },
          },
        },
        staffProfile: {
          select: {
            id: true,
            jobTitle: true,
            department: true,
            employmentStatus: true,
          },
        },
      },
    });

    // OPTIMIZATION: Extract aggregated financial statistics directly from database views or relationship sums if possible.
    // If schema constraints do not map direct relationship math cleanly, execute this optimized flat calculation map.
    const salesAgentIds = users
      .flatMap((u) => u.salesAgentProfile.map((p) => p.id))
      .filter(Boolean);

    const [transactionTotals, commissionTotals] = await prisma.$transaction([
      prisma.transaction.groupBy({
        by: ["agentId"],
        where: { agentId: { in: salesAgentIds } },
        _sum: { amount: true },
      }),
      prisma.commission.groupBy({
        by: ["salesAgentId"],
        where: { salesAgentId: { in: salesAgentIds } },
        _sum: { commissionEarned: true },
      }),
    ]);

    const formatted = users.map((user) => {
      const profile = user.salesAgentProfile[0];
      const totalSales =
        transactionTotals.find((t) => t.agentId === profile?.id)?._sum.amount ||
        0;
      const totalCommissions =
        commissionTotals.find((c) => c.salesAgentId === profile?.id)?._sum
          ?.commissionEarned || 0;

      return {
        id: profile?.id ?? null,
        userId: user.id,
        name: user.name || "N/A",
        email: user.email || "N/A",
        image: user.image || null,
        phoneNumber: profile?.phoneNumber || user.phone || "",
        loginCode: profile?.loginCode || null,
        specialties: profile?.specialties || [],
        regions: profile?.regions || [],
        isActive: profile?.isActive ?? true,
        role: "AGENT",
        staffProfile: user.staffProfile ?? null,
        stats: {
          totalSales,
          totalCommissions,
          transactions: profile?._count?.transactions || 0,
          commissions: profile?._count?.commissions || 0,
          clients: profile?._count?.clients || 0,
        },
        recentTransaction: profile?.transactions?.[0]
          ? {
              amount: profile.transactions[0].amount,
              date: profile.transactions[0].date,
            }
          : null,
        recentCommission: profile?.commissions?.[0]
          ? {
              amount: profile.commissions[0].commissionEarned,
              date: profile.commissions[0].createdAt,
              status: profile.commissions[0].status,
            }
          : null,
        createdAt: profile?.createdAt || user.createdAt,
      };
    });

    try {
      await cacheSet(cacheKey, formatted, 60);
    } catch (e) {}

    return formatResponse(true, formatted, "Fetched agents successfully", 200);
  } catch (error) {
    return formatResponse(
      false,
      null,
      "Failed to retrieve agents dataset",
      500,
    );
  }
});

// =====================
// POST /api/sales-agents
// =====================
export const POST = withAuthAndRateLimit(async (request) => {
  try {
    const body = await request.json();
    let {
      name,
      email,
      phoneNumber,
      password,
      companyId,
      specialties,
      regions,
      profileImageUrl,
    } = body;

    if (!name || !email || !phoneNumber || !companyId) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    email = email.toLowerCase().trim();

    // Check availability prior to running expensive Bcrypt work
    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (exists) {
      return formatResponse(
        false,
        null,
        "User with this email already exists",
        409,
      );
    }

    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(
      password || "defaultPassword123",
      10,
    );

    const agent = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          email,
          phone: phoneNumber,
          password: hashedPassword,
          image: profileImageUrl || null,
          role: "AGENT",
          salesAgentProfile: {
            create: {
              companyId,
              phoneNumber,
              loginCode,
              specialties: specialties || [],
              regions: regions || [],
            },
          },
          staffProfile: {
            create: {
              companyId,
              jobTitle: "Sales Agent",
              department: "Sales",
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          salesAgentProfile: {
            select: { id: true, loginCode: true },
          },
        },
      });
    });

    // Explicit cache invalidation fix
    try {
      await cacheDel(`tenant:${companyId}:agents:*`);
      await cacheDel(`tenant:${companyId}:agents:*`);
      await cacheDel(`admin:agents:*`);
    } catch (e) {}


    return formatResponse(true, agent, "Agent created successfully", 201);
  } catch (error) {
    // Catch rare unique constraint violations for loginCode race conditions gracefully (Prisma P2002)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return formatResponse(
        false,
        null,
        "A registration parameter collision occurred. Try again.",
        409,
      );
    }
    return formatResponse(
      false,
      null,
      "Failed to create agent record profile",
      500,
    );
  }
});
