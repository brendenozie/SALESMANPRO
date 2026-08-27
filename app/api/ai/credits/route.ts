/**
 * app/api/ai/credits/route.ts
 *
 * GET /api/ai/credits - Returns tenant credit balance and top-up packages.
 * POST /api/ai/credits - Top-up or purchase AI credits.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { creditLedger } from "@/lib/ai/creditLedger";
import prisma from "@/server/db/prismadb";

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
      packages,
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

    const { packageId, customCredits, paymentMethod = "MPESA", phone, referenceId } = body;

    let creditsToAdd = 0;
    let priceToPay = 0;
    let packageName = "Custom AI Credits";

    if (packageId) {
      const pkg = await prisma.aIPackage.findUnique({
        where: { id: packageId },
      });
      if (!pkg) {
        return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
      }
      creditsToAdd = pkg.credits;
      priceToPay = pkg.price;
      packageName = pkg.name;
    } else if (customCredits && customCredits > 0) {
      creditsToAdd = parseInt(customCredits, 10);
      priceToPay = Math.round((creditsToAdd / 100) * 1); // $1 per 100 credits default
    } else {
      return NextResponse.json(
        { success: false, error: "Please specify a packageId or customCredits" },
        { status: 400 },
      );
    }

    // Top up the tenant's credit wallet
    const result = await creditLedger.topUpCredits({
      companyId: auth.companyId,
      userId: auth.userId,
      amount: creditsToAdd,
      type: "PURCHASE",
      description: `Purchased ${packageName} (${creditsToAdd.toLocaleString()} Credits)`,
      referenceId: referenceId || `topup_${Date.now()}`,
      metadata: {
        paymentMethod,
        phone,
        price: priceToPay,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully credited ${creditsToAdd.toLocaleString()} AI credits to ${auth.companyName}`,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    });
  } catch (error: any) {
    console.error("[POST_AI_CREDITS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process credit top-up" },
      { status: error.statusCode || 500 },
    );
  }
}
