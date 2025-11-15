import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  const { companyId, planId } = await req.json();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { user: true }
  });

  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // 1. Create Paystack customer
  const customerRes = await fetch("https://api.paystack.co/customer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: company.user?.email })
  });

  const customerData = await customerRes.json();

  // 2. Initiate subscription payment
  const paymentRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: company.user?.email,
      amount: Number(plan.price) * 100,
      callback_url: `${process.env.NEXT_PUBLIC_API_URL}/payments/paystack/verify-subscription`,
      metadata: {
        companyId,
        planId,
      }
    })
  });

  const paymentData = await paymentRes.json();

  return NextResponse.json(paymentData);
}
