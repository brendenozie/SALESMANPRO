import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { PlanStatus, SubscriptionStatus, BillingCycle } from '@prisma/client'; // Import the new enums
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// =================================================================================================
// PLANS API ROUTES
// These routes handle fetching, creating, updating, and deleting plans.
// =================================================================================================

// GET /api/plans
// Fetches all plans with support for pagination and filtering by companyId.
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const skip = (page - 1) * perPage;

    // Filter parameters
    const companyId = searchParams.get('companyId');

    // Construct the Prisma WHERE clause dynamically
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const totalItems = await prisma.plan.count({ where });

    const plans = await prisma.plan.findMany({
      skip,
      take: perPage,
      where,
    });

    // Manually sort the plans by createdAt in descending order
    const sortedPlans = plans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalPages = Math.ceil(totalItems / perPage);

    return NextResponse.json({
      plans: sortedPlans,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ message: 'Failed to fetch plans', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/plans
// Handles creating a new plan.
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const {
      companyId,
      name,
      description,
      priceMonthly,
      priceAnnually,
      features,
      isPopular,
      status
    } = await request.json();

    if (!companyId || !name || !description || priceMonthly === undefined || priceAnnually === undefined || !features) {
      return NextResponse.json({ message: 'Missing required fields for plan creation.' }, { status: 400 });
    }

    const newPlan = await prisma.plan.create({
      data: {
        companyId,
        name,
        description,
        priceMonthly,
        priceAnnually,
        features,
        isPopular,
        status,
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ message: 'Failed to create plan', error: (error as Error).message }, { status: 500 });
  }
}

