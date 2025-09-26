import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- Type Definitions for the Handler ---

type RouteParams = {
  adminSlug: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace with your actual User type if defined
};

// --- Core Logic for GET request ---

async function handleGet(request: Request, context: HandlerContext): Promise<NextResponse> {
  const { adminSlug } = context.params;

  // 1. Total Events
  const totalEvents = await prisma.event.count({
    where: { company: { slug: adminSlug } },
  });

  // 2. Upcoming Events
  const upcomingEvents = await prisma.event.count({
    where: {
      company: { slug: adminSlug },
      startDateTime: { gt: new Date() },
      eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
    },
  });

  // 3. Total Tickets Sold
  const totalTicketsSoldResult = await prisma.orderItem.aggregate({
    where: {
      order: {
        company: { slug: adminSlug },
        status: "COMPLETED",
      },
      marketplaceListing: {
        productCategory: {
          name: "Event Tickets",
        },
      },
    },
    _sum: {
      quantity: true,
    },
  });
  const totalTicketsSold = totalTicketsSoldResult._sum.quantity || 0;

  // 4. Total Revenue
  const totalRevenueResult = await prisma.customerOrder.aggregate({
    where: {
      company: { slug: adminSlug },
      status: "COMPLETED",
    },
    _sum: {
      totalPrice: true,
    },
  });
  const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

  // 5. Recent Activities
  const recentActivities = await prisma.customerOrder.findMany({
    where: { company: { slug: adminSlug } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      customerName: true,
      totalPrice: true,
      status: true,
      createdAt: true,
    },
  });

  const formattedActivities = recentActivities.map(order => ({
    id: order.id,
    type: "Order",
    description: `Order #${order.id} by ${order.customerName || 'N/A'} (${order.status}) for $${order.totalPrice.toFixed(2)}`,
    time: order.createdAt.toISOString(),
  }));

  // 6. Upcoming Events List
  const upcomingEventsList = await prisma.event.findMany({
    where: {
      company: { slug: adminSlug },
      startDateTime: { gt: new Date() },
      eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
    },
    orderBy: { startDateTime: "asc" },
    take: 3,
    select: {
      id: true,
      title: true,
      startDateTime: true,
    },
  });

  const formattedUpcomingEventsList = upcomingEventsList.map(event => ({
    id: event.id,
    name: event.title,
    date: new Date(event.startDateTime).toLocaleDateString(),
    ticketsSold: Math.floor(Math.random() * 1000) // Mocking for demo
  }));

  return NextResponse.json({
    totalEvents,
    upcomingEvents,
    totalTicketsSold,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    recentActivities: formattedActivities,
    upcomingEventsList: formattedUpcomingEventsList,
  }, { status: 200 });
}

// --- Exported Route Handler (Wrapped) ---

/**
 * GET /api/admin/[adminSlug]/dashboard-summary
 * Provides a summary of key metrics for an admin dashboard.
 */
export const GET = withApiHandler(handleGet);
