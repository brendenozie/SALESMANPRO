import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
// app/api/admin/reports/orders-by-status/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; // Adjust path as needed

export async function GET(req: NextRequest) {
  // --- AUTHENTICATION & AUTHORIZATION PLACEHOLDER ---
  // In a real app, verify user's session/token and role here.
  // Example: const userId = await getUserIdFromSession(req);
  // if (!userId || !userHasPermission(userId, 'ADMIN')) {
  //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }
  // You might also check if the user belongs to the companyId being queried.
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

    const ordersByStatus = await prisma.customerOrder.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    return NextResponse.json(ordersByStatus);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders by status', error: "error.message" },
      { status: 500 }
    );
  }
}
