import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");

  if (!reference) {
    const failure = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
    failure.searchParams.set("message", "No payment reference provided.");
    return NextResponse.redirect(failure);
  }

  try {
    // 1. Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();
    console.log("Paystack verification:", verifyData);

    if (!verifyData.status || verifyData.data.status !== "success") {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set("message", verifyData.message || "Payment failed.");
      return NextResponse.redirect(failureUrl);
    }

    const metadata = verifyData.data.metadata;

    if (!metadata.companyId || !metadata.planId) {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set("message", "Missing subscription metadata.");
      return NextResponse.redirect(failureUrl);
    }

    // Optional additional metadata
    const billingPeriod = metadata.billingPeriod || "MONTHLY"; 
    const monthsPaidFor = Number(metadata.monthsPaidFor || 1);
    const yearsPaidFor = Number(metadata.yearsPaidFor || 0);

    // 2. Verify user
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set("message", "User not authenticated.");
      return NextResponse.redirect(failureUrl);
    }

    // 3. Fetch plan
    const plan = await prisma.plan.findUnique({
      where: { id: metadata.planId },
    });

    if (!plan) {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set("message", "Plan not found.");
      return NextResponse.redirect(failureUrl);
    }

    // 4. Calculate correct price
    let unitPrice = plan.priceMonthly ?? plan.price ?? 1;

    if (billingPeriod === "ANNUALLY") {
      unitPrice = plan.priceAnnually ?? ((plan.priceMonthly ?? plan.price ?? 1) * 12);
    }

    const expectedAmount =
      billingPeriod === "ANNUALLY"
        ? unitPrice * yearsPaidFor
        : unitPrice * monthsPaidFor;

    const paidAmount = verifyData.data.amount / 100;

    if (paidAmount < expectedAmount) {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set(
        "message",
        `Amount mismatch. Expected ${expectedAmount}, got ${paidAmount}.`
      );
      return NextResponse.redirect(failureUrl);
    }

    // 5. Calculate renewal date
    const renewalDate = new Date();

    if (billingPeriod === "ANNUALLY") {
      renewalDate.setFullYear(renewalDate.getFullYear() + yearsPaidFor);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + monthsPaidFor);
    }

    // 6. Save subscription
    await prisma.$transaction([
      prisma.subscriptionCompany.create({
        data: {
          companyId: metadata.companyId,
          userId,
          planId: metadata.planId,
          status: "ACTIVE",
          paystackRef: verifyData.data.reference,
          renewalDate,
        },
      }),

      prisma.company.update({
        where: { id: metadata.companyId },
        data: { hasWebsite: true },
      }),

      prisma.billingTransaction.create({
        data: {
          amount: paidAmount,
          currency: verifyData.data.currency,
          companyId: metadata.companyId,
          userId,
          type: "SUBSCRIPTION",
          status: "SUCCESS",
          paymentMethod: "PAYSTACK",
          description: `Subscription: ${plan.name} (${billingPeriod})`,
        },
      }),
    ]);

    // 7. Redirect on success
    const successUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboards`);
    successUrl.searchParams.set("subscribed", "true");
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Verification error:", err);

    const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
    failureUrl.searchParams.set("message", "Server error. Contact support.");
    return NextResponse.redirect(failureUrl);
  }
}


// import prisma from "@/server/db/prismadb";
// import { NextResponse } from "next/server";
// import { getAuthSession } from "@/lib/auth";

// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const reference = url.searchParams.get("reference");

//   if (!reference) {
//     const failure = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//     failure.searchParams.set("message", "No payment reference provided.");
//     return NextResponse.redirect(failure);
//   }

//   try {
//     const verifyRes = await fetch(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     const verifyData = await verifyRes.json();
//     console.log("Paystack verification response:", verifyData);

//     if (!verifyData.status || verifyData.data.status !== "success") {
//       const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//       failureUrl.searchParams.set("message", verifyData.message || "Payment verification failed.");
//       return NextResponse.redirect(failureUrl);
//     }

//     const meta = verifyData.data.metadata;

//     // FIXED: Only require company + plan
//     if (!meta.companyId || !meta.planId) {
//       const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//       failureUrl.searchParams.set("message", "Metadata incomplete. Contact support.");
//       return NextResponse.redirect(failureUrl);
//     }

//     // Get logged-in user
//     const session = await getAuthSession();
//     const userId = session?.user?.id;

//     if (!userId) {
//       const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//       failureUrl.searchParams.set("message", "User not authenticated.");
//       return NextResponse.redirect(failureUrl);
//     }

//     const plan = await prisma.plan.findUnique({
//       where: { id: meta.planId },
//     });

//     if (!plan) {
//       const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//       failureUrl.searchParams.set("message", "Plan not found.");
//       return NextResponse.redirect(failureUrl);
//     }

//     const renewalDate = new Date();
//     renewalDate.setDate(renewalDate.getDate() + 30);

//     await prisma.$transaction([
//       prisma.subscriptionCompany.create({
//         data: {
//           companyId: meta.companyId,
//           userId,
//           planId: meta.planId,
//           status: "ACTIVE",
//           paystackRef: verifyData.data.reference,
//           renewalDate,
//         },
//       }),

//       prisma.company.update({
//         where: { id: meta.companyId },
//         data: { hasWebsite: true },
//       }),

//       prisma.billingTransaction.create({
//         data: {
//           amount: verifyData.data.amount / 100,
//           currency: verifyData.data.currency,
//           companyId: meta.companyId,
//           userId,
//           type: "SUBSCRIPTION",
//           status: "SUCCESS",
//           paymentMethod: "PAYSTACK",
//           description: `Subscription to plan ${meta.planId}`,
//         },
//       }),
//     ]);

//     const successUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboards`);
//     successUrl.searchParams.set("subscribed", "true");
//     return NextResponse.redirect(successUrl);
//   } catch (err) {
//     console.error("Verification error:", err);

//     const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//     failureUrl.searchParams.set("message", "Server error. Contact support.");
//     return NextResponse.redirect(failureUrl);
//   }
// }
