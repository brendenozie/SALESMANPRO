/**
 * app/api/ads/track/route.ts
 *
 * Ad Event Tracking Endpoint (Beacon / POST).
 * Ingests IMPRESSION, CLICK, and CONVERSION events.
 * Multi-tenant safe, fraud-resistant, with atomic spend deductions.
 */

import { NextRequest, NextResponse } from "next/server";
import { AdTrackingService } from "@/lib/ads/adTrackingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      campaignId,
      creativeId,
      placementCode,
      companyId,
      listingId,
      productId,
      viewerSessionId,
      conversionValueKES,
      orderId,
      metadata,
    } = body;

    if (!campaignId || !type) {
      return NextResponse.json(
        { success: false, error: "campaignId and event type are required." },
        { status: 400 },
      );
    }

    if (type === "IMPRESSION") {
      const result = await AdTrackingService.trackImpression({
        campaignId,
        creativeId,
        placementCode: placementCode || "UNKNOWN",
        companyId,
        listingId,
        productId,
        viewerSessionId,
        metadata,
      });
      return NextResponse.json(result);
    }

    if (type === "CLICK") {
      const result = await AdTrackingService.trackClick({
        campaignId,
        creativeId,
        placementCode: placementCode || "UNKNOWN",
        companyId,
        listingId,
        productId,
        viewerSessionId,
        metadata,
      });
      return NextResponse.json(result);
    }

    if (type === "CONVERSION") {
      const result = await AdTrackingService.trackConversion({
        campaignId,
        creativeId,
        placementCode,
        conversionValueKES: Number(conversionValueKES) || 0,
        orderId,
        viewerSessionId,
        metadata,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: `Unsupported event type '${type}'. Must be IMPRESSION, CLICK, or CONVERSION.` },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("[ADS_TRACK_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process tracking event" },
      { status: 500 },
    );
  }
}
