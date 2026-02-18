import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from '@/server/db/prismadb';
import { BillingCycle, SubscriptionStatus } from '@prisma/client';
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// ============================================================================
// GET /api/subscriptions 
// List subscriptions with pagination + filters
// ============================================================================
async function handleGETV1(request: Request) {
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

    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (planId) where.planId = planId;
    if (status) where.status = status;

    const totalItems = await prisma.subscriptionCompany.count({ where });

    const subscriptions = await prisma.subscriptionCompany.findMany({
      skip,
      take: perPage,
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, priceMonthly: true, priceAnnually: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            type: true,
            paidAt: true,
          },
          orderBy: { paidAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(totalItems / perPage);

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

    const where: any = {};

    // --- CHANGE START ---
    // Instead of filtering the subscriber (where.companyId), 
    // we filter the plan's owner (where.plan.companyId)
    if (companyId) {
      where.plan = {
        companyId: companyId
      };
    }
    // --- CHANGE END ---

    if (planId) where.planId = planId;
    if (status) where.status = status;

    
    const cacheKey = `admin:subscriptions-companies:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const totalItems = await prisma.subscriptionCompany.count({ where });

  try {
    if (totalItems) {
      await cacheSet(cacheKey, totalItems, 60);
    }
  } catch (e) {}

    const subscriptions = await prisma.subscriptionCompany.findMany({
      skip,
      take: perPage,
      where,
      include: {
        // company: { select: { id: true, name: true, email: true } }, // Added company to see who subscribed
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, priceMonthly: true, priceAnnually: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            type: true,
            paidAt: true,
          },
          orderBy: { paidAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(totalItems / perPage);

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

// ============================================================================
// POST /api/subscriptions
// Create a new subscription + first payment record
// ============================================================================
async function handlePOST(request: Request) {
  try {
    const {
      userId,
      companyId,
      planId,
      billingCycle,
      amountPaid,
      currency,
      gateway,
      gatewayRef,
      startDate,
      renewalDate,
      status,
      metadata,
    } = await request.json();

    // Required fields
    if (!userId || !companyId || !planId || !billingCycle || amountPaid === undefined) {
      return formatResponse(
        false,
        null,
        "Missing required fields: userId, companyId, planId, billingCycle, amountPaid.",
        400
      );
    }

    // Create subscription first
    const subscription = await prisma.subscriptionCompany.create({
      data: {
        userId,
        companyId,
        planId,
        billingCycle,
        amountPaid,
        currency: currency || "USD",
        status: status || SubscriptionStatus.ACTIVE,
        startedAt: startDate ? new Date(startDate) : new Date(),
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        gateway,
        gatewaySubscriptionId: gatewayRef || null,
        meta: metadata || null
      }
    });

    // Create first payment history entry
    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: amountPaid,
        currency: currency || "USD",
        status: "SUCCESS",
        type: "INITIAL",
        gateway,
        gatewayRef,
        paidAt: new Date(),
        meta: metadata || null
      }
    });

    
    try { await cacheDel(`admin:subscriptions-companies:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, subscription, "Subscription created successfully.");

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return formatResponse(false, null, error.message, 500);
  }
}

// Export with middleware
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
