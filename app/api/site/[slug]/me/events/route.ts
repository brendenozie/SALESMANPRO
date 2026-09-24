/**
 * app/api/site/[slug]/me/events/route.ts
 * 
 * GET /api/site/[slug]/me/events
 * Returns user's registered/purchased event tickets and organized events for the customer portal.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "User identity not found in session" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // 1. Fetch tickets/attendee passes registered to or purchased by this user
    const orConditions: any[] = [];
    if (userEmail) {
      orConditions.push({ email: userEmail });
      orConditions.push({ purchase: { buyerEmail: userEmail } });
    }
    if (userId) {
      orConditions.push({ purchase: { buyerId: userId } });
    }

    const attendeePasses = await prisma.eventTicketAttendee.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        event: true,
        ticket: true,
        purchase: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch events organized by this user
    const organizedEvents = userId
      ? await prisma.event.findMany({
          where: { organizerId: userId },
          orderBy: { startDateTime: "desc" },
          take: 20,
        })
      : [];

    // 3. Map attendee passes to rich event ticket objects with scannable QR
    const items = await Promise.all(
      attendeePasses.map(async (pass) => {
        let qrUrl = pass.qrCodeUrl;
        if (!qrUrl && pass.ticketCode) {
          try {
            qrUrl = await QRCode.toDataURL(pass.ticketCode, {
              width: 250,
              margin: 1,
              color: { dark: "#0f172a", light: "#ffffff" },
            });
          } catch (e) {}
        }

        return {
          id: pass.id,
          eventId: pass.eventId,
          title: pass.event?.title || "Event Admission",
          description: pass.event?.description,
          startDate: pass.event?.startDateTime?.toISOString() || new Date().toISOString(),
          endDate: pass.event?.endDateTime?.toISOString(),
          location: pass.event?.location || "Venue TBA",
          imageUrl: pass.event?.imageUrl,
          category: pass.ticket?.name || pass.event?.eventType || "General",
          ticketCode: pass.ticketCode,
          ticketName: pass.ticket?.name || "Admission Pass",
          ticketPrice: pass.ticket?.price || 0,
          attendeeName: pass.fullName,
          attendeeEmail: pass.email,
          checkInStatus: pass.checkInStatus,
          checkedInAt: pass.checkedInAt?.toISOString() || null,
          qrCodeUrl: qrUrl,
          paymentStatus: pass.purchase?.paymentStatus || "PAID",
          isPurchasedTicket: true,
        };
      })
    );

    // Also include organized events
    organizedEvents.forEach((orgEvent) => {
      // Don't duplicate if already in items for this event
      if (!items.some((i) => i.eventId === orgEvent.id)) {
        items.push({
          id: orgEvent.id,
          eventId: orgEvent.id,
          title: orgEvent.title,
          description: orgEvent.description,
          startDate: orgEvent.startDateTime?.toISOString() || new Date().toISOString(),
          endDate: orgEvent.endDateTime?.toISOString(),
          location: orgEvent.location || "Venue TBA",
          imageUrl: orgEvent.imageUrl,
          category: orgEvent.eventType || "Event",
          ticketCode: orgEvent.id,
          ticketName: "Organizer View",
          ticketPrice: orgEvent.price || 0,
          attendeeName: session.user.name || "Organizer",
          attendeeEmail: session.user.email || "",
          checkInStatus: "PENDING",
          checkedInAt: null,
          qrCodeUrl: null,
          paymentStatus: "N/A",
          isPurchasedTicket: false,
        });
      }
    });

    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return NextResponse.json(
      { error: "Internal server error fetching tickets" },
      { status: 500 }
    );
  }
}
