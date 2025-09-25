import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

// app/api/admin/reports/sales-agent-revenue/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; // Adjust path as needed

export async function GET(req: NextRequest) {
  // --- AUTHENTICATION & AUTHORIZATION PLACEHOLDER ---
  // Only ADMINs or authorized personnel should access reports.
  // --- END PLACEHOLDER ---

  try {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'startDate and endDate are required.' }, { status: 400 });
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // Include the whole end day

    const whereClause: any = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    if (companyId) {
      whereClause.companyId = companyId;
    }

    // Aggregate commissions by sales agent
    const salesAgentRevenue = await prisma.commission.groupBy({
      by: ['salesAgentId'],
      _sum: {
        commissionEarned: true,
      },
      where: whereClause,
    });

    // Fetch sales agent names
    const agentIds = salesAgentRevenue.map(item => item.salesAgentId);
    const agents = await prisma.salesAgent.findMany({
      where: {
        id: { in: agentIds },
      },
      select: {
        id: true,
        user: {
          select: { name: true }, // Assuming SalesAgent has a relation to User for name
        },
      },
    });

    const agentMap = new Map(agents.map(agent => [agent.id, agent.user?.name || 'Unknown Agent']));

    const formattedRevenue = salesAgentRevenue.map(item => ({
      name: agentMap.get(item.salesAgentId) || 'Unknown Agent',
      totalRevenue: item._sum.commissionEarned || 0,
    }));

    return NextResponse.json(formattedRevenue);
  } catch (error) {
    console.error('Error fetching sales agent revenue:', error);
    return NextResponse.json(
      { message: 'Failed to fetch sales agent revenue', error: "error.message" },
      { status: 500 }
    );
  }
}
