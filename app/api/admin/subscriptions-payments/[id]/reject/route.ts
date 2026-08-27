import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;
    const { reason } = await request.json(); // Optional: allow admin to state why

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch subscription
      const sub = await tx.subscriptionCompany.findUnique({
        where: { id: subscriptionId },
        include: { payments: { where: { status: "PENDING" } } }
      });

      if (!sub) throw new Error("Subscription not found");
      
      // 2. Update Subscription to REJECTED or CANCELLED
      // Note: We move it out of AWAITING_CONFIRMATION so it stops appearing in the "Needs Review" list
      const updatedSub = await tx.subscriptionCompany.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED", // or "REJECTED" depending on your enum
          meta: {
            ...(sub.meta as object),
            rejectionReason: reason || "Invalid transaction reference",
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

    try{ await cacheDel(`admin:subscriptions:${result.companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}