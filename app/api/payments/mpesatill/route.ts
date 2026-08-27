import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { revalidateCompanyCache } from "@/lib/company-fetcher";

export async function POST(req: Request) {
  try {
    // ✅ Auth
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { companyId, planId, phone, reference, amount, billingPeriod } =
      await req.json();

    if (!companyId || !planId || !phone) {
      return NextResponse.json(
        { message: "companyId, planId and phone are required" },
        { status: 400 },
      );
    }

    // ✅ Validate company ownership
    const company = await prisma.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    // ✅ Validate plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    // ✅ Compute amount
    let unitPrice = plan.priceMonthly ?? plan.price ?? 0;

    // if (billingCycle === "ANNUALLY") {
    //   unitPrice =
    //     plan.priceAnnually ??
    //     (plan.priceMonthly ?? plan.price ?? 0) * 12;
    // }

    // const amount =
    //   billingCycle === "ANNUALLY"
    //     ? unitPrice * yearsPaidFor
    //     : unitPrice * monthsPaidFor;

    if (amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    // ✅ Prevent duplicate pending subscriptions
    const existing = await prisma.subscriptionCompany.findFirst({
      where: {
        companyId,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You already have a pending subscription" },
        { status: 400 },
      );
    }

    // ✅ Temp reference (real mpesa ref comes from SMS)
    // const tempRef = `TILL-${Date.now()}`;
    // Calculate renewal duration based on billing period
    const durationDays = billingPeriod === "ANNUALLY" ? 365 : 30;
    const renewalDate = new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000,
    );

    // ✅ Create subscription + payment
    const subscription = await prisma.subscriptionCompany.create({
      data: {
        companyId,
        userId,
        planId,
        // status: "PENDING",
        billingCycle: billingPeriod,
        amountPaid: amount,
        currency: "KES",
        gateway: "MPESA_TILL",
        startedAt: new Date(),
        status: "AWAITING_CONFIRMATION",
        //give a day for testing purposes
        renewalDate: renewalDate,
        meta: {
          phone,
          // monthsPaidFor,
          // yearsPaidFor,
        },
        payments: {
          create: {
            amount,
            currency: "KES",
            status: "PENDING",
            type: "INITIAL",
            gateway: "MPESA_TILL",
            gatewayRef: reference,
            gatewayMessage: "Awaiting Till confirmation",
            meta: { phone },
          },
        },
      },
      include: { payments: true },
    });

     // 2. Clear Next.js App Router Cache for the specific company
    if (companyId) {
      // Fetch lightweight company details to get slug and domain
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, slug: true, domain: true },
      });

      if (company) {
        // Because Next.js `unstable_cache` keys rely on the identifier string the user navigated to,
        // we must revalidate all possible identifiers (id, slug, and domain) to ensure the UI updates everywhere.
        await revalidateCompanyCache(company.id);
        if (company.slug) await revalidateCompanyCache(company.slug);
        if (company.domain) await revalidateCompanyCache(company.domain);

        // Handle www. variations if your frontend might cache them differently
        if (company.domain && !company.domain.startsWith("www.")) {
          await revalidateCompanyCache(`www.${company.domain}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscription created. Pay via Till and wait for confirmation.",
      subscriptionId: subscription.id,
      amount,
      tillNumber: process.env.NEXT_PUBLIC_TILL_NUMBER,
    });
  } catch (err: any) {
    console.error("Till subscribe error:", err);

    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}