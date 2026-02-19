import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from '@/server/db/prismadb';
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// GET /api/subscriptions - List subscriptions with pagination and filters
async function handleGET(request: Request) {
  
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Filters
    const companyId = searchParams.get('companyId');
    const planId = searchParams.get('planId');
    const status = searchParams.get('status');

    // Construct WHERE clause
    const where: any = {};
    if (companyId) where.plan = { companyId };
    if (planId) where.planId = planId;
    if (status) where.status = status;

    
    const cacheKey = `admin:subscriptions:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const totalItems = await prisma.subscription.count({ where });

    const subscriptions = await prisma.subscription.findMany({
      skip,
      take: perPage,
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' }, // Sort descending
    });

    const totalPages = Math.ceil(totalItems / perPage);

    try {
      if (subscriptions) {
        await cacheSet(cacheKey, { subscriptions, totalItems, totalPages, currentPage: page, perPage }, 60);
      }
    } catch (e) {
      console.error("Error caching subscriptions data:", e);
    }

    return formatResponse(true, {
      subscriptions,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
    });

  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return formatResponse(false, null, error.message, 500);
  }
}

// POST /api/subscriptions - Create a new subscription
async function handlePOST(request: Request) {
  


  try {
    const {
      userId,
      planId,
      startDate,
      endDate,
      status,
      billingCycle,
      amount,
      paymentMethod,
      lastPaymentDate
    } = await request.json();

    if (!userId || !planId || !startDate || !status || !billingCycle || amount === undefined) {
      return formatResponse(false, null, 'Missing required fields: userId, planId, startDate, status, billingCycle, and amount are mandatory.', 400);
    }

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        billingCycle,
        amount,
        paymentMethod,
        lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate) : null,
      },
    });

    
    try { await cacheDel(`admin:subscriptions:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newSubscription, 'Subscription created successfully.');

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return formatResponse(false, null, error.message, 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
