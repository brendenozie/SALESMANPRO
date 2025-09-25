import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";
// app/api/admin/reports/total-revenue/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; // Adjust path as needed

export async function GET(req: NextRequest) {
  // --- AUTHENTICATION & AUTHORIZATION PLACEHOLDER ---
  // Only ADMINs or authorized personnel should access reports.
  // --- END PLACEHOLDER ---

   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  try {
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

    const totalRevenueResult = await prisma.customerOrder.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: whereClause,
    });

    return NextResponse.json({ totalRevenue: totalRevenueResult._sum.totalPrice || 0 });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    return NextResponse.json(
      { message: 'Failed to fetch total revenue', error: "error.message" },
      { status: 500 }
    );
  }
}
