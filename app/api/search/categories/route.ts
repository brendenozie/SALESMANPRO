/**
 * app/api/search/categories/route.ts
 *
 * Endpoint returning the category taxonomy tree with subcategories and icons.
 */

import { NextResponse } from "next/server";
import { CategoryService } from "@/lib/search/categoryService";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || undefined;

    const categories = await CategoryService.getCategoryTree(companyId);

    return NextResponse.json(
      { categories },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error: any) {
    console.error("[API/search/categories] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
