/**
 * app/api/site/[slug]/me/purchases/route.ts
 *
 * Dedicated Purchases & Transaction History API for Consumers
 * Returns all purchases, entitlements, and order records for the authenticated consumer.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email || "";

    const { slug } = await params;
    const company = await prisma.company.findFirst({
      where: { OR: [{ slug }, { id: slug.length === 24 ? slug : undefined }] },
      select: { id: true, name: true, slug: true },
    });

    const companyId = company?.id;

    // 1. Fetch digital content access records (Media / Videos / Articles)
    const accessRecords = await prisma.contentAccess.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }, { consumerId: userId }] : []),
          ...(email ? [{ customerId: email }] : []),
        ],
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch customer order records
    const orders = await prisma.customerOrder.findMany({
      where: {
        OR: [
          ...(userId ? [{ consumerId: userId }] : []),
          ...(email ? [{ customerEmail: email }] : []),
        ],
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    // Map into unified purchase items
    const purchases = accessRecords.map((acc) => ({
      id: acc.id,
      contentId: acc.contentId,
      contentType: acc.contentType,
      reference: acc.orderId || acc.transactionId || `ACC-${acc.id.slice(-6)}`,
      amount: acc.amount || 0,
      currency: acc.currency || "USD",
      status: acc.paymentStatus || "COMPLETED",
      accessGranted: acc.accessGranted,
      date: acc.createdAt,
      type: "DIGITAL_MEDIA",
    }));

    return NextResponse.json({
      success: true,
      purchases,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        date: o.createdAt,
        itemsCount: o.items?.length || 0,
      })),
      totalSpent: purchases
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    });
  } catch (error: any) {
    console.error("[GET_USER_PURCHASES_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
