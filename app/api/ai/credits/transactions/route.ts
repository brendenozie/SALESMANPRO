/**
 * app/api/ai/credits/transactions/route.ts
 *
 * GET /api/ai/credits/transactions
 * Returns paginated immutable credit ledger transactions for the tenant.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { creditLedger } from "@/lib/ai/creditLedger";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const type = searchParams.get("type") as any;

    const data = await creditLedger.getTransactions({
      companyId: auth.companyId,
      page,
      limit,
      type,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("[GET_CREDIT_TRANSACTIONS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transactions" },
      { status: error.statusCode || 500 },
    );
  }
}
