import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { computeRenewalDate } from "@/lib/subscriptions/subscription-plans";
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
      // Handles MONTHLY, ANNUALLY and LAUNCH:<pkg> (multi-month launch packages)
      const renewalDate = computeRenewalDate(sub.billingCycle, now);

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
            gatewayMessage: `Approved by Admin ${session.user.name || session.user.email || ""}`.trim(),
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