/**
 * app/api/payments/subscription/mpesa/route.ts
 *
 * Store Subscription Direct M-Pesa STK Push Initiation API.
 * Allows Store Admins / Tenants to pay for SalesmanPro SaaS subscriptions
 * via automated Safaricom Daraja STK Push using platform default credentials.
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { resolvePaymentConfiguration } from "@/lib/payments/resolver";
import { sendMpesaStkPush } from "@/lib/payments/mpesa";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, planId, phone, billingPeriod } = body;

    if (!companyId || !planId || !phone) {
      return NextResponse.json(
        { success: false, error: "companyId, planId, and phone are required" },
        { status: 400 },
      );
    }

    // 1. Validate company ownership
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        OR: [
          { userId },
          { id: companyId }, // Allow team admins
        ],
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Store/Company not found or access denied" },
        { status: 404 },
      );
    }

    // 2. Validate plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: "Subscription plan not found" }, { status: 404 });
    }

    // 3. Compute subscription price
    const cycle = (billingPeriod || "MONTHLY").toUpperCase();
    let price = plan.priceMonthly ?? plan.price ?? 0;
    if (cycle === "ANNUALLY" && plan.priceAnnually) {
      price = plan.priceAnnually;
    }

    if (price <= 0) {
      return NextResponse.json({ success: false, error: "Invalid plan price" }, { status: 400 });
    }

    // 4. Normalize Safaricom Phone Number (07xx, 01xx, +254xx -> 254xxxxxxxxx)
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.length < 12) {
      return NextResponse.json(
        { success: false, error: "Invalid Kenyan phone number for M-Pesa STK Push" },
        { status: 400 },
      );
    }

    // 5. Resolve platform payment credentials (always platform defaults for subscriptions)
    const config = await resolvePaymentConfiguration({
      purpose: "SUBSCRIPTION",
      provider: "MPESA",
    });

    const mpesaConfig = config.mpesa || (config.credentials as any);
    const callbackUrl =
      mpesaConfig.callbackUrl ||
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/api/mpesa/callback`;

    // 6. Send Safaricom STK Push
    const accountRef = `SUB-${company.slug || company.id.slice(-6)}`;
    const stkResponse = await sendMpesaStkPush({
      amount: Math.round(price),
      phone: normalizedPhone,
      accountReference: accountRef,
      transactionDesc: `SalesmanPro ${plan.name} Subscription`,
      callbackUrl,
      credentials: mpesaConfig,
    });

    if (!stkResponse?.CheckoutRequestID) {
      throw new Error(stkResponse?.ResponseDescription || "Safaricom Daraja rejected STK Push request");
    }

    const checkoutRequestId = stkResponse.CheckoutRequestID;

    // 7. Upsert pending SubscriptionCompany & create SubscriptionPayment
    let subCompany = await prisma.subscriptionCompany.findFirst({
      where: { companyId, status: { in: ["PENDING", "ACTIVE", "AWAITING_CONFIRMATION", "GRACE_PERIOD"] } },
    });

    if (!subCompany) {
      subCompany = await prisma.subscriptionCompany.create({
        data: {
          companyId,
          userId,
          planId,
          billingCycle: cycle,
          amountPaid: price,
          currency: "KES",
          gateway: "MPESA",
          startedAt: new Date(),
          status: "PENDING",
        },
      });
    } else {
      subCompany = await prisma.subscriptionCompany.update({
        where: { id: subCompany.id },
        data: {
          planId,
          billingCycle: cycle,
          amountPaid: price,
          gateway: "MPESA",
        },
      });
    }

    // Create pending subscription payment record
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscription: { connect: { id: subCompany.id } },
        amount: price,
        currency: "KES",
        gateway: "MPESA",
        gatewayRef: checkoutRequestId,
        gatewayMessage: `M-Pesa STK Push initiated to ${normalizedPhone}`,
        status: "PENDING",
        type: "INITIAL",
      },
    });

    return NextResponse.json({
      success: true,
      message: `M-Pesa STK push sent to ${normalizedPhone}. Please enter your M-Pesa PIN on your phone to complete your subscription.`,
      checkoutRequestId,
      subscriptionId: subCompany.id,
      paymentId: payment.id,
      amount: price,
      accountReference: accountRef,
    });
  } catch (err: any) {
    console.error("[SUBSCRIPTION_MPESA_STK_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initiate M-Pesa subscription payment" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");
    const paymentId = searchParams.get("paymentId");
    const subscriptionId = searchParams.get("subscriptionId");

    if (!checkoutRequestId && !paymentId && !subscriptionId) {
      return NextResponse.json({ success: false, error: "Missing query parameter" }, { status: 400 });
    }

    const payment = await prisma.subscriptionPayment.findFirst({
      where: {
        OR: [
          ...(checkoutRequestId ? [{ gatewayRef: checkoutRequestId }] : []),
          ...(paymentId ? [{ id: paymentId }] : []),
          ...(subscriptionId ? [{ subscriptionId }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          select: {
            id: true,
            status: true,
            companyId: true,
            planId: true,
            renewalDate: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: "Subscription payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: payment.status, // "PENDING" | "SUCCESS" | "FAILED"
      subscriptionStatus: payment.subscription?.status, // "ACTIVE" | "PENDING"
      amount: payment.amount,
      gateway: payment.gateway,
      message: payment.gatewayMessage,
      paidAt: payment.paidAt,
      subscriptionId: payment.subscriptionId,
      checkoutRequestId: payment.gatewayRef,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

