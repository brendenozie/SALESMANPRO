import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/subscriptions-payments/[id]/approve/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current subscription state
      const sub = await tx.subscriptionCompany.findUnique({
        where: { id: subscriptionId },
        include: { payments: { where: { status: "PENDING" } } }
      });

      if (!sub) throw new Error("Subscription not found");
      if (sub.status === "ACTIVE") throw new Error("Subscription is already active");

      const now = new Date();
      
      // 2. Calculate Renewal Date based on billingCycle
      let renewalDate = new Date();
      if (sub.billingCycle === "ANNUALLY") {
        renewalDate.setFullYear(now.getFullYear() + 1);
      } else {
        renewalDate.setMonth(now.getMonth() + 1);
      }

      // 3. Activate Subscription
      const updatedSub = await tx.subscriptionCompany.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          startedAt: now,
          renewalDate: renewalDate,
        },
      });

      // 4. Update the Payment record
      if (sub.payments.length > 0) {
        await tx.subscriptionPayment.update({
          where: { id: sub.payments[0].id },
          data: {
            status: "SUCCESS",
            paidAt: now,
            gatewayMessage: "Approved by Admin",
          },
        });
      }

      return updatedSub;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}