import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const role = ((session.user as any)?.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const subscriptionId = params.id;
    const { reason } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch subscription
      const sub = await tx.subscriptionCompany.findUnique({
        where: { id: subscriptionId },
        include: { payments: { where: { status: "PENDING" } } }
      });

      if (!sub) throw new Error("Subscription not found");
      
      // 2. Update Subscription to CANCELLED
      const updatedSub = await tx.subscriptionCompany.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED",
          meta: {
            ...(sub.meta as object),
            rejectionReason: reason || "Invalid transaction reference",
            rejectedBy: session.user.id,
            rejectedAt: new Date()
          }
        },
      });

      // 3. Mark payment as FAILED
      if (sub.payments.length > 0) {
        await tx.subscriptionPayment.update({
          where: { id: sub.payments[0].id },
          data: {
            status: "FAILED",
            gatewayMessage: reason || "Reference verification failed",
          },
        });
      }

      return updatedSub;
    });

    try {
      await cacheDel(`tenant:${result.companyId}:subscriptions:*`);
      await cacheDel(`admin:subscriptions:*`);
    } catch (e) {}
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}