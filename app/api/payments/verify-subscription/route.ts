import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");

  if (!reference) {
    const failure = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
    failure.searchParams.set("message", "No payment reference provided.");
    return NextResponse.redirect(failure);
  }

  try {
    // 1. Verify Paystack transaction
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set(
        "message",
        verifyData.message || "Payment verification failed."
      );
      return NextResponse.redirect(failureUrl);
    }

    const meta = verifyData.data.metadata;

    if (!meta.companyId || !meta.planId || !meta.userId) {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set(
        "message",
        "Missing metadata. Contact support."
      );
      return NextResponse.redirect(failureUrl);
    }

    // Get the plan duration
    const plan = await prisma.plan.findUnique({
      where: { id: meta.planId },
    });

    if (!plan) {
      const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
      failureUrl.searchParams.set("message", "Plan not found.");
      return NextResponse.redirect(failureUrl);
    }

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + (30)); //plan.durationDays || 

    // 2. Perform all inserts/updates as a transaction
    await prisma.$transaction([
      prisma.subscriptionCompany.create({
        data: {
          companyId: meta.companyId,
          userId: meta.userId, // FIX: Use your own user ID
          planId: meta.planId,
          status: "ACTIVE",
          paystackRef: verifyData.data.reference,
          renewalDate,
        },
      }),

      prisma.company.update({
        where: { id: meta.companyId },
        data: { hasWebsite: true },
      }),

      prisma.billingTransaction.create({
        data: {
          amount: verifyData.data.amount / 100,
          currency: verifyData.data.currency,
          companyId: meta.companyId,
          userId: meta.userId,
          type: "SUBSCRIPTION",
          status: "SUCCESS",
          paymentMethod: "PAYSTACK",
          description: `Subscription to plan ${meta.planId}`,
        },
      }),
    ]);

    // 3. Redirect on success
    const successUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboards`);
    successUrl.searchParams.set("subscribed", "true");
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Verification error:", err);

    const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
    failureUrl.searchParams.set(
      "message",
      "Unexpected server error. Contact support."
    );
    return NextResponse.redirect(failureUrl);
  }
}

// import prisma from "@/server/db/prismadb";
// import { NextResponse } from "next/server";

// // This is your new GET handler for /api/payments/verify
// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const reference = url.searchParams.get("reference");

//   // 1. Check for reference
//   if (!reference) {
//     const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//     failureUrl.searchParams.set("message", "No payment reference found.");
//     return NextResponse.redirect(failureUrl);
//   }

//   try {
//     // 2. Verify transaction with Paystack
//     const verifyRes = await fetch(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: { Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}` }
//       }
//     );
//     const verifyData = await verifyRes.json();

//     if (!verifyData.status || verifyData.data.status !== "success") {
//       const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//       failureUrl.searchParams.set("message", verifyData.message || "Payment verification failed.");
//       return NextResponse.redirect(failureUrl);
//     }

//     // 3. Get metadata from successful payment
//     const meta = verifyData.data.metadata;
//     const customer = verifyData.data.customer;

//     if (!meta.companyId || !meta.planId || !customer.id) {
//       const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//       failureUrl.searchParams.set("message", "Transaction metadata is incomplete. Please contact support.");
//       return NextResponse.redirect(failureUrl);
//     }

//     // 4. Use a database transaction to ensure all updates succeed or fail together
//     await prisma.$transaction([
//       // 4a. Create the Subscription record
//       prisma.subscriptionCompany.create({
//         data: {
//           companyId: meta.companyId,
//           userId: customer.id, // Using customer ID from Paystack
//           planId: meta.planId,
//           status: "ACTIVE",
//           paystackRef: verifyData.data.reference,
//           renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//         }
//       }),

//       // 4b. Activate the Company
//       prisma.company.update({
//         where: { id: meta.companyId },
//         data: { hasWebsite: true } // Or your equivalent "is_active" field
//       }),

//       // 4c. Log the Billing Transaction
//       prisma.billingTransaction.create({
//         data: {
//           amount: verifyData.data.amount / 100, // Convert from kobo/cents
//           currency: verifyData.data.currency,
//           companyId: meta.companyId,
//           userId: customer.id,
//           type: "SUBSCRIPTION",
//           status: "SUCCESS",
//           paymentMethod: "PAYSTACK",
//           description: `Subscription to plan ${meta.planId}`
//         }
//       })
//     ]);

//     // 5. All successful, redirect to the dashboard
//     const successUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
//     successUrl.searchParams.set("subscribed", "true");
//     return NextResponse.redirect(successUrl);

//   } catch (error) {
//     console.error("Failed to update database after payment verification:", error);
//     // Redirect on any database error
//     const failureUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`);
//     failureUrl.searchParams.set("message", "Failed to activate subscription. Please contact support.");
//     return NextResponse.redirect(failureUrl);
//   }
// }