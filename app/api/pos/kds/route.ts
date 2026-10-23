import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/kds
 * Returns live tickets for the Kitchen Display System (KDS).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const station = searchParams.get("station") || "ALL"; // ALL, KITCHEN, BAR, EXPO
    const showCompleted = searchParams.get("showCompleted") === "true";

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "companyId is required" },
        { status: 400 }
      );
    }

    // Status filter: by default show active orders waiting/preparing/ready
    const statusFilter = showCompleted
      ? { in: ["SENT", "PREPARING", "READY", "SERVED"] }
      : { in: ["SENT", "PREPARING", "READY"] };

    const orders = await prisma.customerOrder.findMany({
      where: {
        companyId,
        kitchenStatus: statusFilter,
        status: { notIn: ["CANCELLED", "FAILED"] },
      },
      include: {
        items: {
          include: {
            marketplaceListing: {
              select: {
                id: true,
                name: true,
                productCategory: { select: { name: true } },
                subCategoryName: true,
                tags: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest tickets first (FIFO for kitchen)
      },
      take: 60,
    });

    const now = Date.now();

    const tickets = orders.map((ord) => {
      const createdTime = ord.kitchenSentAt
        ? new Date(ord.kitchenSentAt).getTime()
        : new Date(ord.createdAt).getTime();
      const elapsedMinutes = Math.max(0, Math.floor((now - createdTime) / 60000));

      // Urgency badge calculation
      const urgency: "normal" | "warning" | "critical" =
        elapsedMinutes >= 15 ? "critical" : elapsedMinutes >= 8 ? "warning" : "normal";

      // Filter or tag items by destination station
      const filteredItems = ord.items.map((item) => {
        const catName =
          item.marketplaceListing?.productCategory?.name?.toLowerCase() ||
          item.marketplaceListing?.subCategoryName?.toLowerCase() ||
          "";
        const isBar =
          catName.includes("bar") ||
          catName.includes("drink") ||
          catName.includes("beverage") ||
          catName.includes("cocktail") ||
          catName.includes("beer") ||
          catName.includes("wine") ||
          catName.includes("juice");

        return {
          id: item.id,
          name: item.marketplaceListing?.name || "Kitchen Item",
          quantity: item.quantity,
          course: item.course || "Mains",
          kitchenStatus: item.kitchenStatus || "PENDING",
          notes: item.serviceNotes || undefined,
          options: item.selectedOptions as any,
          station: isBar ? "BAR" : "KITCHEN",
        };
      });

      return {
        id: ord.id,
        orderNumber: ord.trackingNumber || ord.id.slice(-6).toUpperCase(),
        tableNumber: ord.tableNumber || "Counter",
        guestCount: ord.guestCount || 1,
        serviceMode: ord.serviceMode || "DINE_IN",
        cashierName: ord.cashierName || "Staff",
        kitchenStatus: ord.kitchenStatus || "SENT",
        createdAt: ord.createdAt.toISOString(),
        kitchenSentAt: ord.kitchenSentAt ? ord.kitchenSentAt.toISOString() : ord.createdAt.toISOString(),
        elapsedMinutes,
        urgency,
        items: filteredItems,
      };
    });

    // If specific station requested, filter tickets containing items for that station
    const filteredTickets =
      station === "ALL" || station === "EXPO"
        ? tickets
        : tickets.filter((t) => t.items.some((i) => i.station === station));

    return NextResponse.json({
      success: true,
      station,
      ticketsCount: filteredTickets.length,
      tickets: filteredTickets,
    });
  } catch (error: any) {
    console.error("[API pos/kds GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load KDS tickets" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pos/kds
 * Updates kitchen ticket or item status (e.g. SENT -> PREPARING -> READY -> SERVED).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, itemId, status, companyId } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status are required" },
        { status: 400 }
      );
    }

    // Valid statuses: SENT, PREPARING, READY, SERVED
    const validStatuses = ["SENT", "PREPARING", "READY", "SERVED", "BUMPED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const normalizedStatus = status === "BUMPED" ? "SERVED" : status;

    if (itemId) {
      // Update individual item status
      await prisma.orderItem.update({
        where: { id: itemId },
        data: { kitchenStatus: normalizedStatus },
      });
    } else {
      // Update entire order ticket status
      await prisma.$transaction([
        prisma.customerOrder.update({
          where: { id: orderId },
          data: { kitchenStatus: normalizedStatus },
        }),
        prisma.orderItem.updateMany({
          where: { orderId },
          data: { kitchenStatus: normalizedStatus },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${normalizedStatus}`,
      orderId,
      itemId,
      status: normalizedStatus,
    });
  } catch (error: any) {
    console.error("[API pos/kds PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update kitchen status" },
      { status: 500 }
    );
  }
}
