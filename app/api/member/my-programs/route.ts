import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { z } from "zod";

// Simple CORS configurations identical to your payment gateway setup
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const consumerId = searchParams.get("consumerId");

    if (!consumerId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Missing consumerId" }),
        {
          status: 400,
          headers: CORS_HEADERS,
        },
      );
    }

    // Query active and valid paid programs
    const paidOrders = await prisma.customerOrder.findMany({
      where: {
        consumerId: consumerId,
        // Ensure to pull items where payment actually went through
        // If COD or physical pickup options are used, adjust status parameters accordingly
        // paymentStatus: { in: ["PAID", "SUCCESS", "CONFIRMED"] },
      },
      include: {
        items: true, // Pulls date, timeSlot, price, and marketplaceListingId
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Flatten data layers out so the client-side maps over active items directly
    const purchasedPrograms = paidOrders.flatMap((order) =>
      order.items.map((item) => ({
        id: item.id,
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        marketplaceListingId: item.marketplaceListingId,
        price: item.price,
        quantity: item.quantity,
        scheduledDate: item.date,
        scheduledTimeSlot: item.timeSlot,
        purchasedAt: order.createdAt,
        paymentMethod: order.paymentOption,
      })),
    );

    return new NextResponse(
      JSON.stringify({ success: true, programs: purchasedPrograms }),
      {
        status: 200,
        headers: CORS_HEADERS,
      },
    );
  } catch (error: any) {
    console.error("Failed to retrieve user programs:", error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: CORS_HEADERS,
      },
    );
  }
}
