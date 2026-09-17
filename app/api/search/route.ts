/**
 * app/api/search/route.ts
 *
 * Universal Search API Endpoint.
 * Supports keyword search, category, subcategory, generic and category-specific filters,
 * transparent relevance sorting, pagination, and channel/tenant scoping.
 */

import { NextResponse } from "next/server";
import { SearchService } from "@/lib/search/searchService";
import { SearchScope, ProductSortOption } from "@/lib/search/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || searchParams.get("search") || "";
    const scope = (searchParams.get("scope")?.toUpperCase() as SearchScope) || "GHUBA";
    const companyId = searchParams.get("companyId") || undefined;
    const storeSlug = searchParams.get("storeSlug") || undefined;
    const sort = (searchParams.get("sort") as ProductSortOption) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const cursor = searchParams.get("cursor") || undefined;

    // Generic filters
    const category = searchParams.getAll("category").filter(Boolean);
    const subCategory = searchParams.getAll("subCategory").filter(Boolean);
    const brand = searchParams.getAll("brand").filter(Boolean);
    const condition = searchParams.getAll("condition").filter(Boolean);
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const isAvailable = searchParams.get("isAvailable") !== "false";
    const location = searchParams.get("location") || undefined;

    // Category-specific filters: Vehicles
    const make = searchParams.getAll("make").filter(Boolean);
    const model = searchParams.getAll("model").filter(Boolean);
    const transmission = searchParams.getAll("transmission").filter(Boolean);
    const fuelType = searchParams.getAll("fuelType").filter(Boolean);
    const bodyType = searchParams.getAll("bodyType").filter(Boolean);
    const yearFrom = searchParams.get("yearFrom") ? parseInt(searchParams.get("yearFrom")!, 10) : undefined;
    const yearTo = searchParams.get("yearTo") ? parseInt(searchParams.get("yearTo")!, 10) : undefined;

    // Category-specific filters: Property
    const propertyType = searchParams.getAll("propertyType").filter(Boolean);
    const bedrooms = searchParams.getAll("bedrooms").filter(Boolean);
    const bathrooms = searchParams.getAll("bathrooms").filter(Boolean);
    const rentOrSale = (searchParams.get("rentOrSale") as "SALE" | "RENT" | "ALL") || undefined;

    // Category-specific filters: Electronics
    const storage = searchParams.getAll("storage").filter(Boolean);
    const ram = searchParams.getAll("ram").filter(Boolean);

    // Category-specific filters: Fashion
    const size = searchParams.getAll("size").filter(Boolean);
    const color = searchParams.getAll("color").filter(Boolean);
    const gender = searchParams.getAll("gender").filter(Boolean);

    const result = await SearchService.searchListings({
      q,
      scope,
      companyId,
      storeSlug,
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
        location,
        make: make.length > 0 ? make : undefined,
        model: model.length > 0 ? model : undefined,
        transmission: transmission.length > 0 ? transmission : undefined,
        fuelType: fuelType.length > 0 ? fuelType : undefined,
        bodyType: bodyType.length > 0 ? bodyType : undefined,
        yearFrom,
        yearTo,
        propertyType: propertyType.length > 0 ? propertyType : undefined,
        bedrooms: bedrooms.length > 0 ? bedrooms : undefined,
        bathrooms: bathrooms.length > 0 ? bathrooms : undefined,
        rentOrSale,
        storage: storage.length > 0 ? storage : undefined,
        ram: ram.length > 0 ? ram : undefined,
        size: size.length > 0 ? size : undefined,
        color: color.length > 0 ? color : undefined,
        gender: gender.length > 0 ? gender : undefined,
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
    console.error("[API/search] Error:", error);
    return NextResponse.json(
      { error: "Search execution failed", details: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
