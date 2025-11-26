/**
 * app/api/site/[slug]/me/finance/route.ts
 * 
 * GET /api/site/[slug]/me/finance
 * Returns user's finance data for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserFinance } from "@/lib/db";
import { mapToFinanceTransactionDTO, FinanceListDTO } from "@/types/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get("status") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const finance = await getUserFinance(userId, slug, filters);
    
    const financeDTOs = finance.map(mapToFinanceTransactionDTO);
    
    const response: FinanceListDTO = {
      items: financeDTOs,
      nextCursor: finance.length === filters.limit ? finance[finance.length - 1]?.id || null : null,
      total: financeDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user finance data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
