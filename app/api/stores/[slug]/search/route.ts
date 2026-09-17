/**
 * app/api/stores/[slug]/search/route.ts
 *
 * Dedicated Tenant-Scoped Search Endpoint.
 * Strictly scopes product search to the specific merchant's company catalog.
 * Guarantees zero cross-tenant data leakage.
 */

import { NextResponse } from "next/server";
import { SearchService } from "@/lib/search/searchService";
import { findCompanyCached } from "@/lib/company-fetcher";
import { ProductSortOption } from "@/lib/search/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: "Store slug is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const company = await findCompanyCached(slug, "lean");
    if (!company) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const sort = (searchParams.get("sort") as ProductSortOption) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const cursor = searchParams.get("cursor") || undefined;

    const category = searchParams.getAll("category").filter(Boolean);
    const subCategory = searchParams.getAll("subCategory").filter(Boolean);
    const brand = searchParams.getAll("brand").filter(Boolean);
    const condition = searchParams.getAll("condition").filter(Boolean);
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const isAvailable = searchParams.get("isAvailable") !== "false";

    const result = await SearchService.searchListings({
      q,
      scope: "STORE",
      companyId: company.id,
      storeSlug: slug,
      sort,
      page,
      limit,
      cursor,
      filters: {
        category: category.length > 0 ? category : undefined,
        subCategory: subCategory.length > 0 ? subCategory : undefined,
        brand: brand.length > 0 ? brand : undefined,
        condition: condition.length > 0 ? condition : undefined,
        minPrice,
        maxPrice,
        isAvailable,
      },
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("[API/stores/[slug]/search] Error:", error);
    return NextResponse.json(
      { error: "Store search failed", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
