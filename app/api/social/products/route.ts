/**
 * app/api/social/products/route.ts
 *
 * Fetches available store catalog products for social media marketing,
 * campaign planning, and promotional post generation.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);

    const products = await prisma.product.findMany({
      where: {
        companyId: auth.companyId,
        quantity: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        category: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("[GET /api/social/products] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch store products" },
      { status: error.statusCode || 500 }
    );
  }
}
