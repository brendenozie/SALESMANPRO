/**
 * app/api/ai/credits/route.ts
 *
 * GET /api/ai/credits - Returns tenant credit balance and top-up packages.
 * POST /api/ai/credits - Initiates paid top-up for AI credits via platform default M-Pesa or Paystack.
 *
 * CRITICAL FINANCIAL INTEGRITY:
 * - Credits are NEVER allocated immediately on POST.
 * - Creates a PENDING transaction and initiates payment through platform default credentials.
 * - Credits are allocated ONLY upon authoritative webhook / callback confirmation.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { creditLedger, DEFAULT_AI_PACKAGES } from "@/lib/ai/creditLedger";
import prisma from "@/server/db/prismadb";
import { resolvePaymentConfiguration } from "@/lib/payments/resolver";
import { executeStkPush } from "@/lib/payments/mpesa";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

const USD_TO_KES_RATE = 130; // Standard nominal platform conversion rate

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);

    const balance = await creditLedger.getBalance(auth.companyId);
    const packages = await creditLedger.getPackages();

    // Get usage this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyUsage = await prisma.aIUsage.aggregate({
      where: {
        companyId: auth.companyId,
        createdAt: { gte: startOfMonth },
      },
      _sum: { creditsCost: true, totalTokens: true },
      _count: { id: true },
    });

    // Total purchased / granted
    const totalAdded = await prisma.aICreditTransaction.aggregate({
      where: {
        companyId: auth.companyId,
        type: { in: ["PURCHASE", "PROMOTIONAL", "BONUS", "ADJUSTMENT"] },
        status: "COMPLETED",
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      balance,
      companyId: auth.companyId,
      companyName: auth.companyName,
      stats: {
        usedThisMonth: monthlyUsage._sum.creditsCost ?? 0,
        requestsThisMonth: monthlyUsage._count.id,
        totalTokensThisMonth: monthlyUsage._sum.totalTokens ?? 0,
        totalCreditsPurchased: totalAdded._sum.amount ?? 0,
      },
      packages: packages.length > 0 ? packages : DEFAULT_AI_PACKAGES,
    });
  } catch (error: any) {
    console.error("[GET_AI_CREDITS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch credit balance" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      packageId,
      customCredits,
      paymentMethod = "MPESA",
      phone,
      currency = "KES",
    } = body;

    const pUpper = String(paymentMethod).toUpperCase();

    let creditsToAdd = 0;
    let priceInUsd = 0;
    let packageName = "Custom AI Credits";

    if (packageId) {
      const pkg = await prisma.aIPackage.findUnique({
        where: { id: packageId },
      });
      if (pkg) {
        creditsToAdd = pkg.credits;
        priceInUsd = pkg.price;
        packageName = pkg.name;
      } else {
        // Fallback to default in-memory packages
        const defPkg = DEFAULT_AI_PACKAGES.find((p) => p.name.toLowerCase() === packageId.toLowerCase() || p.credits === Number(packageId));
        if (defPkg) {
          creditsToAdd = defPkg.credits;
          priceInUsd = defPkg.price;
          packageName = defPkg.name;
        } else {
          return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
        }
      }
    } else if (customCredits && customCredits > 0) {
      creditsToAdd = parseInt(customCredits, 10);
      priceInUsd = Math.max(1, Math.round((creditsToAdd / 100) * 1)); // $1 per 100 credits
    } else {
      return NextResponse.json(
        { success: false, error: "Please specify a valid packageId or customCredits" },
        { status: 400 },
      );
    }

    // Convert price to KES for Daraja / Paystack if KES
    const priceInKes = Math.round(priceInUsd * USD_TO_KES_RATE);
    const payableAmount = currency.toUpperCase() === "USD" ? priceInUsd : priceInKes;
    const payableCurrency = currency.toUpperCase() === "USD" ? "USD" : "KES";

    const internalReference = `AICRED-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Create PENDING transaction record (Credits are NOT allocated yet!)
    const pendingTx = await prisma.aICreditTransaction.create({
      data: {
        companyId: auth.companyId,
        userId: auth.userId,
        amount: creditsToAdd,
        type: "PURCHASE",
        status: "PENDING",
        description: `Purchasing ${packageName} (${creditsToAdd.toLocaleString()} Credits) - Awaiting Payment`,
        referenceId: internalReference,
        metadata: {
          packageName,
          creditsRequested: creditsToAdd,
          priceInUsd,
          payableAmount,
          payableCurrency,
          paymentMethod: pUpper,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    // =========================================================================
    // 2. INITIATE VIA PLATFORM DEFAULT M-PESA
    // =========================================================================
    if (pUpper === "MPESA") {
      const rawPhone = phone || (auth.user as any)?.phone;
      const normalizedPhone = normalizePhoneNumber(rawPhone);

      if (!normalizedPhone || normalizedPhone.length < 12) {
        return NextResponse.json(
          { success: false, error: "Valid Safaricom M-Pesa phone number required (e.g. 2547XXXXXXXX or 2541XXXXXXXX)" },
          { status: 400 },
        );
      }

      const resolved = await resolvePaymentConfiguration({
        purpose: "AI_CREDIT_TOPUP",
        provider: "MPESA",
        storeId: auth.companyId,
      });

      const stkResult = await executeStkPush({
        phoneNumber: normalizedPhone,
        amount: priceInKes,
        accountReference: internalReference.substring(0, 12),
        transactionDesc: `AI Credits ${packageName}`.substring(0, 32),
        credentials: resolved.credentials as any,
      });

      const checkoutRequestId = stkResult.CheckoutRequestID || stkResult.MerchantRequestID;

      // Link CheckoutRequestID to pending transaction so callback can match it
      if (checkoutRequestId) {
        await prisma.aICreditTransaction.update({
          where: { id: pendingTx.id },
          data: {
            referenceId: checkoutRequestId,
            idempotencyKey: checkoutRequestId,
            metadata: {
              ...(pendingTx.metadata as any || {}),
              checkoutRequestId,
              merchantRequestId: stkResult.MerchantRequestID,
              internalReference,
              phone: normalizedPhone,
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        status: "INITIATED",
        paymentMethod: "MPESA",
        checkoutRequestId,
        referenceId: internalReference,
        amount: priceInKes,
        currency: "KES",
        message: `M-Pesa STK push of KES ${priceInKes.toLocaleString()} sent to ${normalizedPhone}. Please enter your M-Pesa PIN on your phone to complete credit purchase.`,
      });
    }

    // =========================================================================
    // 3. INITIATE VIA PLATFORM DEFAULT PAYSTACK
    // =========================================================================
    if (pUpper === "PAYSTACK") {
      const email = auth.user.email;
      if (!email) {
        return NextResponse.json(
          { success: false, error: "User email required for Paystack payment" },
          { status: 400 },
        );
      }

      const resolved = await resolvePaymentConfiguration({
        purpose: "AI_CREDIT_TOPUP",
        provider: "PAYSTACK",
        storeId: auth.companyId,
      });

      const paystackResult = await initializePaystackTransaction({
        email,
        amount: payableAmount,
        currency: payableCurrency,
        reference: internalReference,
        metadata: {
          purpose: "AI_CREDIT_TOPUP",
          companyId: auth.companyId,
          userId: auth.userId,
          creditsToAdd,
          transactionId: pendingTx.id,
        },
        credentials: resolved.credentials as any,
      });

      await prisma.aICreditTransaction.update({
        where: { id: pendingTx.id },
        data: {
          referenceId: paystackResult.reference,
          idempotencyKey: paystackResult.reference,
          metadata: {
            ...(pendingTx.metadata as any || {}),
            paystackReference: paystackResult.reference,
            authorizationUrl: paystackResult.authorization_url,
          },
        },
      });

      return NextResponse.json({
        success: true,
        status: "INITIATED",
        paymentMethod: "PAYSTACK",
        reference: paystackResult.reference,
        authorizationUrl: paystackResult.authorization_url,
        amount: payableAmount,
        currency: payableCurrency,
        message: "Paystack checkout initialized. Please complete payment at the authorization URL.",
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported payment method for AI credits: ${paymentMethod}` },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("[POST_AI_CREDITS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate AI credit purchase" },
      { status: error.statusCode || 500 },
    );
  }
}
