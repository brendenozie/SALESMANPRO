import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { PlanStatus, SubscriptionStatus, BillingCycle } from '@prisma/client'; // Import the new enums

// =================================================================================================
// SUBSCRIPTIONS API ROUTES
// These routes handle fetching, creating, updating, and deleting subscriptions.
// =================================================================================================

// GET /api/subscriptions
// Fetches all subscriptions with support for pagination and filtering by companyId, planId, or status.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Filter parameters
    const companyId = searchParams.get('companyId');
    const planId = searchParams.get('planId');
    const status = searchParams.get('status');

    // Construct the Prisma WHERE clause dynamically
    const where: any = {};
    if (companyId) {
      // Find subscriptions for plans belonging to this company
      where.plan = { companyId };
    }
    if (planId) {
      where.planId = planId;
    }
    if (status) {
      where.status = status;
    }

    // Fetch total count for pagination
    const totalItems = await prisma.subscription.count({ where });

    // Fetch subscriptions with pagination and filters
    const subscriptions = await prisma.subscription.findMany({
      skip,
      take: perPage,
      where,
      // Include related User and Plan data for the client
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    // Manually sort the subscriptions by createdAt in descending order
    const sortedSubscriptions = subscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalPages = Math.ceil(totalItems / perPage);

    return NextResponse.json({
      subscriptions: sortedSubscriptions,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ message: 'Failed to fetch subscriptions', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/subscriptions
// Handles creating a new subscription.
export async function POST(request: Request) {
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

    // Check for required fields
    if (!userId || !planId || !startDate || !status || !billingCycle || amount === undefined) {
      return NextResponse.json({ message: 'Missing required fields: userId, planId, startDate, status, billingCycle, and amount are mandatory.' }, { status: 400 });
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

    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ message: 'Failed to create subscription', error: (error as Error).message }, { status: 500 });
  }
}
