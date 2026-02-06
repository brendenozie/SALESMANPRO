import prisma from '@/server/db/prismadb';
import { BillingCycle, SubscriptionStatus } from '@prisma/client';
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from '@/lib/hooks/withApiHandler';

// ============================================================================
// GET /api/subscriptions 
// List subscriptions with pagination + filters
// ============================================================================
// // app/api/admin/subscription-payments/route.ts
import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; // Adjust based on your project structure

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    // Filter payments belonging to a specific company's plans
    const where: any = {};
    // if (companyId) {
    //   where.subscription = {
    //     plan: { companyId: companyId }
    //   };
    // }
    // if (status) where.status = status;

    const payments = await prisma.subscriptionPayment.findMany({
      where,
      include: {
        subscription: {
          include: {
            user: { select: { name: true, email: true } },
            plan: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

    return formatResponse(true, subscription, "Subscription created successfully.");

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return formatResponse(false, null, error.message, 500);
  }
}

// Export with middleware
// export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
