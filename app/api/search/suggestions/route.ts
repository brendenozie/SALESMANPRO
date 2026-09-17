/**
 * app/api/search/suggestions/route.ts
 *
 * Fast Autocomplete & Suggestion API.
 * Returns matching products, categories, brands, stores, and keywords.
 */

import { NextResponse } from "next/server";
import { SearchService } from "@/lib/search/searchService";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const scope = (searchParams.get("scope")?.toUpperCase() as "GHUBA" | "STORE") || "GHUBA";
    const companyId = searchParams.get("companyId") || undefined;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { query: "", suggestions: [], products: [], categories: [], brands: [], stores: [] },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const suggestions = await SearchService.getAutocompleteSuggestions({
      query,
      scope,
      companyId,
    });

    return NextResponse.json(suggestions, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("[API/search/suggestions] Error:", error);
    return NextResponse.json(
      { query: "", suggestions: [], products: [], categories: [], brands: [], stores: [] },
      { status: 200, headers: CORS_HEADERS }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
