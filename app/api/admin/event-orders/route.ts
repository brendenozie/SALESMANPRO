// =========================================================
// app/api/admin/event-orders/route.ts
// =========================================================

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function getEventOrders(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const eventId = searchParams.get("eventId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const whereClause: any = {};

  if (companyId) {
    whereClause.OR = [
      { companyId: companyId },
      { event: { companyId: companyId } }
    ];
  }

  if (eventId) {
    whereClause.eventId = eventId;
  }

  if (status) {
    if (status === "COMPLETED") {
      whereClause.paymentStatus = { in: ["COMPLETED", "PAID"] };
    } else {
      whereClause.paymentStatus = status;
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    whereClause.AND = [
      {
        OR: [
          { id: { contains: term, mode: "insensitive" } },
          { buyerName: { contains: term, mode: "insensitive" } },
          { buyerEmail: { contains: term, mode: "insensitive" } },
          { event: { title: { contains: term, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const purchases = await prisma.eventTicketPurchase.findMany({
    where: whereClause,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDateTime: true,
          location: true,
          companyId: true,
        },
      },
      ticket: {
        select: {
          id: true,
          name: true,
          ticketType: true,
          price: true,
        },
      },
      attendees: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          ticketCode: true,
          checkInStatus: true,
          checkedInAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
  });

  const orders = purchases.map((p) => {
    // Map status for UI compatibility
    let uiStatus = p.paymentStatus;
    if (uiStatus === "PAID") uiStatus = "COMPLETED";

    return {
      id: p.id,
      eventId: p.eventId,
      eventTitle: p.event?.title || "Event",
      eventDate: p.event?.startDateTime?.toISOString() || null,
      eventLocation: p.event?.location || null,
      userId: p.buyerId || "",
      customerName: p.buyerName || "Guest Customer",
      customerEmail: p.buyerEmail || "",
      customerPhone: p.buyerPhone || "",
      totalPrice: p.totalAmount,
      status: uiStatus,
      rawStatus: p.paymentStatus,
      createdAt: p.createdAt.toISOString(),
      paymentMethod: p.paymentMethod || "Online",
      paymentTransactionId: (p as any).paymentTransactionId || p.id,
      ticketName: p.ticket?.name || "Standard Ticket",
      ticketType: p.ticket?.ticketType || "REGULAR",
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      items: [
        {
          id: p.ticket?.id || p.id,
          name: p.ticket?.name || "Event Ticket",
          quantity: p.quantity,
          price: p.unitPrice,
          ticketType: p.ticket?.ticketType || "REGULAR",
        },
      ],
      attendees: p.attendees,
    };
  });

  return formatResponse(
    true,
    {
      orders,
      totalCount: orders.length,
    },
    "Orders fetched successfully",
    200
  );
}

export const GET = withApiHandler(getEventOrders, {
  requireAuth: false,
});
