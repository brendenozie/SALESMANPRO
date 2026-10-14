/**
 * app/api/super-admin/payments/operations/route.ts
 *
 * SalesmanPro & Ghuba Payment Operations Telemetry API.
 * Aggregates:
 * 1. Gateway Health & Configuration Readiness (M-Pesa & Paystack)
 * 2. Pending Till Number Verifications (Stage 1 Admin & Stage 2 Super-Admin)
 * 3. AI Credit Revenue Telemetry (Purchases vs Usage)
 * 4. Ghuba Merchant Collections vs Commission vs Outstanding Settlement Liabilities
 * 5. Rider Delivery Earnings & Payout Requests
 */

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { getPlatformMpesaCredentials, getPlatformPaystackCredentials, getPlatformTillCredentials } from "@/lib/payments/resolver";
import { TillPaymentService } from "@/lib/payments/tillService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const role = ((session.user as any)?.role || "").toUpperCase();
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Administrator privileges strictly required" },
        { status: 403 },
      );
    }

    // 1. Gateway Health Check (WITHOUT revealing raw secrets)
    const mpesa = getPlatformMpesaCredentials();
    const paystack = getPlatformPaystackCredentials();
    const till = getPlatformTillCredentials();

    const isMpesaConfigured = Boolean(
      mpesa.consumerKey && mpesa.consumerSecret && mpesa.shortcode && mpesa.passkey
    );
    const isPaystackConfigured = Boolean(paystack.secretKey && paystack.publicKey);

    const mpesaHealth = {
      provider: "Safaricom Daraja 2.0 M-Pesa",
      status: isMpesaConfigured ? "CONFIGURED" : "INCOMPLETE",
      environment: mpesa.baseUrl.includes("sandbox") ? "SANDBOX" : "PRODUCTION",
      shortcode: mpesa.shortcode ? `${mpesa.shortcode.substring(0, 3)}***` : "NOT_SET",
      transactionType: mpesa.transactionType,
      hasConsumerKey: Boolean(mpesa.consumerKey),
      hasConsumerSecret: Boolean(mpesa.consumerSecret),
      hasPasskey: Boolean(mpesa.passkey),
      hasCallbackUrl: Boolean(mpesa.callbackUrl),
      callbackUrlHost: mpesa.callbackUrl ? new URL(mpesa.callbackUrl).host : "NOT_SET",
    };

    const paystackHealth = {
      provider: "Paystack",
      status: isPaystackConfigured ? "CONFIGURED" : "INCOMPLETE",
      environment: paystack.secretKey.startsWith("sk_live") ? "PRODUCTION" : "TEST",
      publicKeyPrefix: paystack.publicKey ? paystack.publicKey.substring(0, 7) : "NOT_SET",
      hasSecretKey: Boolean(paystack.secretKey),
      hasPublicKey: Boolean(paystack.publicKey),
      hasCallbackUrl: Boolean(paystack.callbackUrl),
    };

    const tillHealth = {
      tillNumber: till.tillNumber,
      accountName: till.accountName,
      status: "ACTIVE",
    };

    // 2. Pending Till Number Queue
    const tillQueue = await TillPaymentService.getPendingTillQueue({ stage: "ALL" });

    // 3. AI Credit Revenue & Purchases
    const [aiPurchases, aiUsageStats] = await Promise.all([
      prisma.aICreditTransaction.aggregate({
        where: { type: "PURCHASE", status: "COMPLETED" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.aICreditTransaction.aggregate({
        where: { type: "USAGE" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const recentAiPurchases = await prisma.aICreditTransaction.findMany({
      where: { type: "PURCHASE" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        company: { select: { name: true, slug: true } },
      },
    });

    // 4. Ghuba Merchant Collections vs Settlements
    const [settlementAggregates, riderPayoutStats] = await Promise.all([
      prisma.storeSettlementBalance.aggregate({
        _sum: {
          lifetimeEarnings: true,
          lifetimeWithdrawn: true,
          availableBalance: true,
          reservedBalance: true,
        },
        _count: { id: true },
      }),
      prisma.riderPayout.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // 5. Recent Platform Payment Failures
    const recentFailures = await prisma.payment.findMany({
      where: { status: { in: ["FAILED", "REJECTED", "CANCELLED"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        transactionId: true,
        amount: true,
        currency: true,
        provider: true,
        status: true,
        createdAt: true,
        order: { select: { trackingNumber: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      gateways: {
        mpesa: mpesaHealth,
        paystack: paystackHealth,
        till: tillHealth,
      },
      tillQueue: {
        totalPendingOrders: tillQueue.orders.length,
        totalPendingSubscriptions: tillQueue.subscriptions.length,
        pendingOrders: tillQueue.orders,
        pendingSubscriptions: tillQueue.subscriptions,
      },
      aiCredits: {
        totalPurchasedCredits: aiPurchases._sum.amount ?? 0,
        totalPurchaseTransactions: aiPurchases._count.id,
        totalUsedCredits: Math.abs(aiUsageStats._sum.amount ?? 0),
        recentPurchases: recentAiPurchases.map((tx) => ({
          id: tx.id,
          companyName: tx.company?.name || "Tenant",
          credits: tx.amount,
          status: tx.status,
          reference: tx.referenceId,
          date: tx.createdAt,
          metadata: tx.metadata,
        })),
      },
      settlements: {
        totalStoresTracked: settlementAggregates._count.id,
        lifetimeMerchantGrossCollected: settlementAggregates._sum.lifetimeEarnings ?? 0,
        totalPaidOutToMerchants: settlementAggregates._sum.lifetimeWithdrawn ?? 0,
        outstandingMerchantLiabilities: settlementAggregates._sum.availableBalance ?? 0,
        settlementFundsReserved: settlementAggregates._sum.reservedBalance ?? 0,
      },
      riderPayouts: {
        pendingPayoutRequests: riderPayoutStats._count.id,
        pendingPayoutAmount: riderPayoutStats._sum.amount ?? 0,
      },
      recentFailures: recentFailures.map((f) => ({
        id: f.id,
        transactionId: f.transactionId,
        amount: f.amount,
        currency: f.currency,
        provider: f.provider,
        trackingNumber: f.order?.trackingNumber || "N/A",
        customerName: f.order?.name || "Customer",
        date: f.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("[PAYMENT_OPERATIONS_API_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve payment operations telemetry" },
      { status: 500 },
    );
  }
}
