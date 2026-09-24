import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const propertyId = resolvedParams?.id;

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const {
      checkIn,
      checkOut,
      guests = 1,
      guestName,
      guestEmail,
      guestPhone,
      notes,
    } = body;

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "checkIn and checkOut dates are required" },
        { status: 400 }
      );
    }

    const requestedStart = new Date(checkIn);
    const requestedEnd = new Date(checkOut);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for checkIn or checkOut" },
        { status: 400 }
      );
    }

    if (requestedStart >= requestedEnd) {
      return NextResponse.json(
        { error: "checkOut date must be after checkIn date" },
        { status: 400 }
      );
    }

    // Guard against booking in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedStart < today) {
      return NextResponse.json(
        { error: "checkIn date cannot be in the past" },
        { status: 400 }
      );
    }

    // 1. Fetch Property Listing
    const listing = await prisma.marketplaceListings.findUnique({
      where: { id: propertyId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (!listing.isAvailable || listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This property is currently not available for bookings" },
        { status: 400 }
      );
    }

    if (!listing.companyId) {
      return NextResponse.json(
        { error: "Property is missing tenant association" },
        { status: 400 }
      );
    }

    // Optional user session
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as any)?.id;
    const userEmail = session?.user?.email || guestEmail;
    const userName = session?.user?.name || guestName || "Guest User";

    if (!userEmail) {
      return NextResponse.json(
        { error: "Guest email is required for booking confirmation" },
        { status: 400 }
      );
    }

    // 2. Transactional Overlap Protection & Booking Creation
    const result = await prisma.$transaction(async (tx) => {
      // Hold expiration threshold: 30 minutes
      const holdExpirationThreshold = new Date(Date.now() - 30 * 60 * 1000);

      // Fetch active bookings for this property
      const conflictingBookings = await tx.booking.findMany({
        where: {
          companyId: listing.companyId!,
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
      });

      // Check overlap: Start_A < End_B && End_A > Start_B
      const hasConflict = conflictingBookings.some((b) => {
        if (!b.startDate || !b.endDate) return false;
        return requestedStart < b.endDate && requestedEnd > b.startDate;
      });

      if (hasConflict) {
        throw new Error("OVERLAP_CONFLICT: The selected dates are no longer available for this property.");
      }

      // Resolve or create User
      let user = sessionUserId
        ? await tx.user.findUnique({ where: { id: sessionUserId } })
        : await tx.user.findFirst({ where: { email: userEmail } });

      if (!user) {
        user = await tx.user.create({
          data: {
            email: userEmail,
            name: userName,
            role: "CONSUMER",
          },
        });
      }

      // Resolve or create Consumer
      let consumer = await tx.consumer.findFirst({
        where: {
          email: userEmail,
          companyId: listing.companyId!,
        },
      });

      if (!consumer) {
        consumer = await tx.consumer.create({
          data: {
            name: userName,
            email: userEmail,
            phone: guestPhone || "",
            companyId: listing.companyId!,
            userId: user.id,
          },
        });
      }

      // Resolve or create Client
      let client = await tx.client.findFirst({
        where: {
          userId: user.id,
          companyId: listing.companyId!,
        },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            userId: user.id,
            companyId: listing.companyId!,
            membershipStatus: "ACTIVE",
          },
        });
      }

      // Calculate authoritative pricing
      const diffMs = requestedEnd.getTime() - requestedStart.getTime();
      const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const baseNightlyRate = listing.finalPrice || listing.sellingPrice || 120;
      const subtotal = nights * baseNightlyRate;
      const cleaningFee = Math.round(baseNightlyRate * 0.2);
      const serviceFee = Math.round(subtotal * 0.05);
      const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.16);
      const totalPrice = subtotal + cleaningFee + serviceFee + taxes;

      const bookingMetadata = {
        propertyId: listing.id,
        propertyName: listing.name,
        nights,
        nightlyRate: baseNightlyRate,
        subtotal,
        cleaningFee,
        serviceFee,
        taxes,
        totalPrice,
        guests: Number(guests),
        guestName: userName,
        guestEmail: userEmail,
        guestPhone: guestPhone || "",
        guestNotes: notes || "",
        checkIn: requestedStart.toISOString().split("T")[0],
        checkOut: requestedEnd.toISOString().split("T")[0],
      };

      // Create Booking record
      const booking = await tx.booking.create({
        data: {
          companyId: listing.companyId!,
          clientId: client.id,
          consumerId: consumer.id,
          title: `Stay: ${listing.name}`,
          description: `Property: ${listing.id} | Check-in: ${bookingMetadata.checkIn} | Check-out: ${bookingMetadata.checkOut}`,
          bookingType: "ACCOMMODATION_BOOKING",
          startDate: requestedStart,
          endDate: requestedEnd,
          price: totalPrice,
          totalPrice: totalPrice,
          status: "PENDING",
          notes: JSON.stringify(bookingMetadata),
        },
      });

      return { booking, metadata: bookingMetadata };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking reserved successfully. Please complete payment to confirm your stay.",
        booking: result.booking,
        pricing: result.metadata,
        checkoutUrl: `/checkout?bookingId=${result.booking.id}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PROPERTY_BOOKING_ERROR]", error);
    if (error.message?.includes("OVERLAP_CONFLICT")) {
      return NextResponse.json(
        { error: "The selected dates are no longer available for this property. Please choose different dates." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create booking", details: error?.message },
      { status: 500 }
    );
  }
}
