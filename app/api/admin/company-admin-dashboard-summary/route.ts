// app/api/admin/[adminSlug]/dashboard-summary/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;

  // In a real application, you would validate adminSlug against the authenticated user's company/organization.
  // For this example, we assume it's valid or handled by middleware.

  try {
    // 1. Total Events
    const totalEvents = await prisma.event.count({
      where: { company: { slug: adminSlug } },
    });

    // 2. Upcoming Events (e.g., events starting in the future and not cancelled/completed)
    const upcomingEvents = await prisma.event.count({
      where: {
        company: { slug: adminSlug },
        startDateTime: { gt: new Date() },
        eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
      },
    });

    // 3. Total Tickets Sold (sum of quantities from completed order items linked to event tickets)
    // This requires a more complex query, assuming 'marketplaceListings' with a specific category for tickets
    const totalTicketsSoldResult = await prisma.orderItem.aggregate({
      where: {
        order: {
          company: { slug: adminSlug },
          status: "COMPLETED",
        },
        // Assuming 'marketplaceListings' linked to 'ProductCategory' for event tickets
        marketplaceListing: {
          productCategory: {
            // You might have a specific category name or ID for event tickets
            name: "Event Tickets", // Adjust this based on your actual category setup
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });
    const totalTicketsSold = totalTicketsSoldResult._sum.quantity || 0;

    // 4. Total Revenue (sum of totalPrice from completed CustomerOrders)
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

    // 5. Recent Activities (simplified - could come from AuditLog or recent Event/Order changes)
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

    // 6. Upcoming Events List (for the list on the dashboard)
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
        // You'd need to compute ticketsSold for each event if you want it here
        // For simplicity, we'll mock it or fetch separately if needed
      },
    });

    const formattedUpcomingEventsList = upcomingEventsList.map(event => ({
      id: event.id,
      name: event.title,
      date: new Date(event.startDateTime).toLocaleDateString(), // Format date nicely
      ticketsSold: Math.floor(Math.random() * 1000) // Mocking for demo, replace with actual count
    }));


    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      totalTicketsSold,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      recentActivities: formattedActivities,
      upcomingEventsList: formattedUpcomingEventsList,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}