import { NextRequest, NextResponse } from "next/server";
import { calculateDeliveryQuote, estimateDistanceKm } from "@/lib/logistics-pricing";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companySlug,
      companyId,
      pickupAddress,
      dropoffAddress,
      weightKg,
      dimensionsCm,
      serviceType,
      isFragile,
      requiresColdChain,
      declaredValue,
      urgency,
      customDistanceKm,
    } = body;

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Both pickup address and destination address are required" },
        { status: 400 }
      );
    }

    // Resolve company if slug provided
    let targetCompanyId = companyId;
    let currency = "USD";
    if (companySlug && !targetCompanyId) {
      const company = await prisma.company.findFirst({
        where: {
          OR: [{ slug: companySlug }, { customDomain: companySlug }],
        },
        select: { id: true, currency: true },
      });
      if (company) {
        targetCompanyId = company.id;
        currency = company.currency || "USD";
      }
    }

    const distanceKm =
      customDistanceKm && customDistanceKm > 0
        ? Number(customDistanceKm)
        : estimateDistanceKm(pickupAddress, dropoffAddress);

    const quote = calculateDeliveryQuote({
      pickupAddress,
      dropoffAddress,
      distanceKm,
      weightKg: Number(weightKg) || 1,
      dimensionsCm,
      serviceType: serviceType || "STANDARD",
      isFragile: Boolean(isFragile),
      requiresColdChain: Boolean(requiresColdChain),
      declaredValue: declaredValue ? Number(declaredValue) : undefined,
      urgency: urgency || "STANDARD",
    });

    return NextResponse.json({
      success: true,
      currency,
      quote,
    });
  } catch (error: any) {
    console.error("Error calculating delivery quote:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate quote" },
      { status: 500 }
    );
  }
}
