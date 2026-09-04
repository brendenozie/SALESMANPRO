/**
 * app/api/ads/wallet/route.ts
 *
 * Ad Wallet & Financial Ledger Endpoint.
 * Strictly separates KES Advertising Funds from AI Credits.
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AdBudgetService } from "@/lib/ads/adBudgetService";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const queryCompanyId = searchParams.get("companyId");

    let targetCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN") {
      targetCompanyId = queryCompanyId || undefined;
    }

    const wallet = await AdBudgetService.getOrCreateWallet(targetCompanyId);

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        companyId: wallet.companyId,
        balanceKES: wallet.balance,
        currency: wallet.currency,
        transactions: (wallet as any).transactions || [],
      },
    });
  } catch (error: any) {
    console.error("[ADS_WALLET_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch ad wallet" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();
    const { amountKES, paymentReference, paymentGateway = "MPESA", description } = body;

    if (!amountKES || Number(amountKES) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount in KES is required." },
        { status: 400 },
      );
    }

    const ref = paymentReference || `MPE-AD-${Date.now().toString().slice(-8)}`;

    let targetCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN" && body.companyId) {
      targetCompanyId = body.companyId;
    }

    const result = await AdBudgetService.topUpWallet({
      companyId: targetCompanyId,
      amountKES: Number(amountKES),
      paymentReference: ref,
      paymentGateway,
      description,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully funded Ad Wallet with KES ${Number(amountKES).toLocaleString()}.`,
      ...result,
    });
  } catch (error: any) {
    console.error("[ADS_WALLET_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to top up ad wallet" },
      { status: error.statusCode || 500 },
    );
  }
}
