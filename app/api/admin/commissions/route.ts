import { NextResponse } from "next/server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/admin/clients/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  try {
    // 1. Fetch all commission records with related data
    const commissionStats = await prisma.commission.findMany({
      where: { companyId },
      include: {
        product: { select: { name: true, sellingPrice: true, category: true } },
        SalesAgent: {
          include: { user: { select: { name: true, email: true } } },
        },
        CommissionRate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch standard rates assigned to products
    const productRates = await prisma.commissionRate.findMany({
      where: { companyId },
      include: { product: { select: { name: true } } },
    });

    // 3. Aggregate Agent Performance
    const agentPerformance = await prisma.salesAgent.findMany({
      where: { companyId },
      include: {
        user: { select: { name: true } },
        commissions: {
          where: { status: "COMPLETED" },
          select: { commissionEarned: true },
        },
      },
    });

    const formattedAgents = agentPerformance.map((agent) => ({
      id: agent.id,
      name: agent.user?.name || "Unknown Agent",
      totalEarned: agent.commissions.reduce(
        (acc, curr) => acc + curr.commissionEarned,
        0,
      ),
      count: agent.commissions.length,
    }));

    return NextResponse.json({
      success: true,
      data: {
        history: commissionStats,
        rates: productRates,
        agents: formattedAgents,
      },
    });
  } catch (error) {
    console.error("Commission API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
