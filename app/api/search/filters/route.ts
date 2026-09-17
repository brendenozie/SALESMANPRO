/**
 * app/api/search/filters/route.ts
 *
 * Endpoint returning available facets, price bounds, and category-specific
 * attribute filter definitions for the current scope and category.
 */

import { NextResponse } from "next/server";
import { FilterService } from "@/lib/search/filterService";
import { SearchScope } from "@/lib/search/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");
    const categoryList = searchParams.getAll("category").filter(Boolean);
    const category = categoryList.length > 0 ? (categoryList.length === 1 ? categoryList[0] : categoryList) : categoryParam || undefined;
    const scope = (searchParams.get("scope")?.toUpperCase() as SearchScope) || "GHUBA";
    const companyId = searchParams.get("companyId") || undefined;

    const filters = await FilterService.getAvailableFilters({
      category,
      scope,
      companyId,
    });

    return NextResponse.json(filters, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("[API/search/filters] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
