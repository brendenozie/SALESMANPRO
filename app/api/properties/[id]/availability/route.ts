import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const propertyId = resolvedParams?.id;

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    // 1. Fetch property listing
    const listing = await prisma.marketplaceListings.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        status: true,
        sellingPrice: true,
        finalPrice: true,
        duration: true,
        companyId: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // 2. Fetch all active bookings for this property
    // We check both direct title/description reference or notes containing propertyId
    const holdExpirationThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes hold

    const bookings = await prisma.booking.findMany({
      where: {
        companyId: listing.companyId || undefined,
        bookingType: "ACCOMMODATION_BOOKING",
        OR: [
          { notes: { contains: propertyId } },
          { description: { contains: propertyId } },
        ],
        AND: [
          {
            OR: [
              { status: "CONFIRMED" },
              {
                status: "PENDING",
                createdAt: { gte: holdExpirationThreshold },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    const bookedRanges = bookings
      .filter((b) => b.startDate && b.endDate)
      .map((b) => ({
        id: b.id,
        start: b.startDate!.toISOString().split("T")[0],
        end: b.endDate!.toISOString().split("T")[0],
        status: b.status,
      }));

    // 3. Evaluate specific date range if requested
    let isAvailable = listing.isAvailable && listing.status === "ACTIVE";
    let pricing = null;

    if (checkInParam && checkOutParam) {
      const requestedStart = new Date(checkInParam);
      const requestedEnd = new Date(checkOutParam);

      if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
        return NextResponse.json({ error: "Invalid date format for checkIn or checkOut" }, { status: 400 });
      }

      if (requestedStart >= requestedEnd) {
        return NextResponse.json({ error: "checkOut date must be after checkIn date" }, { status: 400 });
      }

      // Check overlap: Start_A < End_B && End_A > Start_B
      const hasOverlap = bookings.some((b) => {
        if (!b.startDate || !b.endDate) return false;
        return requestedStart < b.endDate && requestedEnd > b.startDate;
      });

      if (hasOverlap) {
        isAvailable = false;
      }

      // Calculate pricing
      const diffMs = requestedEnd.getTime() - requestedStart.getTime();
      const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const baseNightlyRate = listing.finalPrice || listing.sellingPrice || 120;
      const subtotal = nights * baseNightlyRate;
      const cleaningFee = Math.round(baseNightlyRate * 0.2); // standard cleaning
      const serviceFee = Math.round(subtotal * 0.05); // 5% platform service
      const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.16); // 16% VAT
      const total = subtotal + cleaningFee + serviceFee + taxes;

      pricing = {
        nights,
        nightlyRate: baseNightlyRate,
        subtotal,
        cleaningFee,
        serviceFee,
        taxes,
        total,
        currency: "USD",
      };
    } else {
      // General nightly rate
      const baseNightlyRate = listing.finalPrice || listing.sellingPrice || 120;
      pricing = {
        nightlyRate: baseNightlyRate,
        cleaningFee: Math.round(baseNightlyRate * 0.2),
        serviceFeePercent: 5,
        taxPercent: 16,
        currency: "USD",
      };
    }

    return NextResponse.json({
      success: true,
      propertyId,
      propertyName: listing.name,
      isAvailable,
      bookedRanges,
      pricing,
    });
  } catch (error: any) {
    console.error("[PROPERTY_AVAILABILITY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to determine availability", details: error?.message },
      { status: 500 }
    );
  }
}
