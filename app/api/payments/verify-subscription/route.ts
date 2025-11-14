import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    }
  );
  const verifyData = await verifyRes.json();

  if (verifyData.data.status !== "success") {
    return NextResponse.redirect(`${process.env.APP_URL}/subscription/failed`);
  }

  const meta = verifyData.data.metadata;

  // 1. Create Subscription
  await prisma.subscriptionCompany.create({
    data: {
      companyId: meta.companyId,
      userId: verifyData.data.customer.id,
      planId: meta.planId,
      status: "ACTIVE",
      paystackRef: verifyData.data.reference,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  });

  // 2. Activate Company
  await prisma.company.update({
    where: { id: meta.companyId },
    data: { hasWebsite: true }
  });

  // 3. Save BillingTransaction
  await prisma.billingTransaction.create({
    data: {
      amount: verifyData.data.amount / 100,
      currency: verifyData.data.currency,
      companyId: meta.companyId,
      userId: verifyData.data.customer.id,
      type: "SUBSCRIPTION",
      status: "SUCCESS",
      paymentMethod: "PAYSTACK",
      description: `Subscription to plan ${meta.planId}`
    }
  });

  return NextResponse.redirect(`${process.env.APP_URL}/dashboard?subscribed=1`);
}
