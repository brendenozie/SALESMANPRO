import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// ============================================================================
// GET /api/subscriptions/payments
// ============================================================================
async function handleGET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Filters
    const subscriptionId = searchParams.get('subscriptionId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const gateway = searchParams.get('gateway');

    const where: any = {};
    if (subscriptionId) where.subscriptionId = subscriptionId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (gateway) where.gateway = gateway;

    const totalItems = await prisma.subscriptionPayment.count({ where });

    const payments = await prisma.subscriptionPayment.findMany({
      skip,
      take: perPage,
      where,
      include: {
        subscription: {
          select: {
            id: true,
            userId: true,
            planId: true,
          }
        }
      },
      orderBy: { paidAt: "desc" }
    });

    const totalPages = Math.ceil(totalItems / perPage);

    return formatResponse(true, {
      payments,
      totalItems,
      totalPages,
      currentPage: page,
      perPage
    });
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    return formatResponse(false, null, error.message, 500);
  }
}

export const GET = withApiHandler(handleGET);
