/**
 * app/api/ads/serve/route.ts
 *
 * Lightweight High-Performance Ad Serving Endpoint.
 * Resolves active contextual ads for Ghuba, Storefronts, and SalesmanPro pages.
 */

import { NextRequest, NextResponse } from "next/server";
import { AdServingEngine } from "@/lib/ads/adServingEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placementCode = searchParams.get("placementCode");
    const category = searchParams.get("category") || undefined;
    const location = searchParams.get("location") || undefined;
    const searchQuery = searchParams.get("q") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 5;

    if (!placementCode) {
      return NextResponse.json(
        { success: false, error: "placementCode parameter is required." },
        { status: 400 },
      );
    }

    const ads = await AdServingEngine.serveAds({
      placementCode,
      category,
      location,
      searchQuery,
      limit,
    });

    return NextResponse.json({
      success: true,
      placementCode,
      ads,
      count: ads.length,
    });
  } catch (error: any) {
    console.error("[ADS_SERVE_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to serve ads" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { placementCode, category, location, searchQuery, limit = 5, viewerSessionId } = body;

    if (!placementCode) {
      return NextResponse.json(
        { success: false, error: "placementCode is required." },
        { status: 400 },
      );
    }

    const ads = await AdServingEngine.serveAds({
      placementCode,
      category,
      location,
      searchQuery,
      viewerSessionId,
      limit,
    });

    return NextResponse.json({
      success: true,
      placementCode,
      ads,
      count: ads.length,
    });
  } catch (error: any) {
    console.error("[ADS_SERVE_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to serve ads" },
      { status: 500 },
    );
  }
}
