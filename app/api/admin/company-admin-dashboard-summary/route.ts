import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

type HandlerContext = {
  params: { adminSlug: string };
  user?: any;
};

const COMPLETED = "COMPLETED";
const UPCOMING_STATUSES = ["SCHEDULED", "POSTPONED"] as const;

async function handleGet(_req: Request, context: HandlerContext) {
  const { adminSlug } = context.params;

  const now = new Date();

  const companyFilter = {
    company: { slug: adminSlug },
  };

  const cacheKey = `admin:company-admin-dashboard-summary:${adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const [
    totalEvents,
    upcomingEvents,
    ticketsSoldAgg,
    revenueAgg,
    recentOrders,
    upcomingEventsRaw,
  ] = await Promise.all([
    // 1. Total events
    prisma.event.count({
      where: companyFilter,
    }),

    // 2. Upcoming events
    prisma.event.count({
      where: {
        ...companyFilter,
        startDateTime: { gt: now },
        eventStatus:{
          in: [...UPCOMING_STATUSES],
        }
      },
    }),

    // 3. Tickets sold
    prisma.orderItem.aggregate({
      where: {
        order: {
          Company: { slug: adminSlug },
          status: COMPLETED,
        },
        marketplaceListing: {
          productCategory: { name: "Event Tickets" },
        },
      },
      _sum: { quantity: true },
    }),

    // 4. Revenue
    prisma.customerOrder.aggregate({
      where: {
        Company: { slug: adminSlug },
        status: COMPLETED,
      },
      _sum: { totalPrice: true },
    }),

    // 5. Recent activity
    prisma.customerOrder.findMany({
      where: { Company: { slug: adminSlug } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    }),

    // 6. Upcoming events list
    prisma.event.findMany({
      where: {
        ...companyFilter,
        startDateTime: { gt: now },
        eventStatus: { in: [...UPCOMING_STATUSES] },
      },
      orderBy: { startDateTime: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        startDateTime: true,
      },
    }),
  ]);

  const totalTicketsSold = ticketsSoldAgg._sum.quantity ?? 0;
  const totalRevenue = revenueAgg._sum.totalPrice ?? 0;

  const recentActivities = recentOrders.map(order => ({
    id: order.id,
    type: "Order",
    description: `Order #${order.id} • ${order.status}`,
    amount: order.totalPrice ?? 0,
    time: order.createdAt?.toISOString(),
  }));

  const upcomingEventsList = upcomingEventsRaw.map(event => ({
    id: event.id,
    name: event.title,
    date: event.startDateTime.toISOString(),
    ticketsSold: null, // can be aggregated later per event
  }));

  try {
    if (totalEvents) {
      await cacheSet(cacheKey, {
        totalEvents,
        upcomingEvents,
        totalTicketsSold: ticketsSoldAgg._sum.quantity ?? 0,
        totalRevenue: revenueAgg._sum.totalPrice ?? 0,
        recentActivities,
        upcomingEventsList
      }, 60);
    }
  } catch (e) {}

  
  return NextResponse.json(
    {
      totalEvents,
      upcomingEvents,
      totalTicketsSold,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      recentActivities,
      upcomingEventsList,
    },
    { status: 200 }
  );
}


export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
//  {
//   const { adminSlug } = context.params;
//   const now = new Date();

//   try {
//     // OPTIMIZATION: Fire all 6 queries in parallel
//     const [
//       totalEvents,
//       upcomingEventsCount,
//       totalTicketsSoldResult,
//       totalRevenueResult,
//       recentActivities,
//       upcomingEventsList
//     ] = await Promise.all([
//       // 1. Total Events
//       prisma.event.count({ where: { company: { slug: adminSlug } } }),

//       // 2. Upcoming Events Count
//       prisma.event.count({
//         where: {
//           company: { slug: adminSlug },
//           startDateTime: { gt: now },
//           eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
//         },
//       }),

//       // 3. Total Tickets Sold (Aggregated)
//       prisma.orderItem.aggregate({
//         where: {
//           order: { Company: { slug: adminSlug }, status: "COMPLETED" },
//           marketplaceListing: { productCategory: { name: "Event Tickets" } },
//         },
//         _sum: { quantity: true },
//       }),

//       // 4. Total Revenue (Aggregated)
//       prisma.customerOrder.aggregate({
//         where: { Company: { slug: adminSlug }, status: "COMPLETED" },
//         _sum: { totalPrice: true },
//       }),

//       // 5. Recent Activities
//       prisma.customerOrder.findMany({
//         where: { Company: { slug: adminSlug } },
//         orderBy: { createdAt: "desc" },
//         take: 5,
//         select: { id: true, name: true, totalPrice: true, status: true, createdAt: true },
//       }),

//       // 6. Upcoming Events List (with real counts)
//       prisma.event.findMany({
//         where: {
//           company: { slug: adminSlug },
//           startDateTime: { gt: now },
//           eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
//         },
//         orderBy: { startDateTime: "asc" },
//         take: 3,
//         select: {
//           id: true,
//           title: true,
//           startDateTime: true,
//           _count: { select: { eventTickets: true } } // Assuming eventTickets relation
//         },
//       }),
//     ]);

//     // Formatting Data
//     const totalRevenue = Number(totalRevenueResult._sum.totalPrice || 0);
    
//     const formattedActivities = recentActivities.map(order => ({
//       id: order.id,
//       type: "Order",
//       description: `Order #${order.id} by ${order.name || 'N/A'} (${order.status}) for $${Number(order.totalPrice).toFixed(2)}`,
//       time: order.createdAt,
//     }));

//     const formattedUpcomingEvents = upcomingEventsList.map(event => ({
//       id: event.id,
//       name: event.title,
//       date: event.startDateTime,
//       ticketsCount: event._count.eventTickets
//     }));

//     return NextResponse.json({
//       totalEvents,
//       upcomingEvents: upcomingEventsCount,
//       totalTicketsSold: totalTicketsSoldResult._sum.quantity || 0,
//       totalRevenue: parseFloat(totalRevenue.toFixed(2)),
//       recentActivities: formattedActivities,
//       upcomingEventsList: formattedUpcomingEvents,
//     });

//   } catch (error: any) {
//     return formatResponse(false, null, error.message, 500);
//   }
// }

// export const GET = withApiHandler(handleGet);
// import { NextResponse } from "next/server";


//   // 2. Upcoming Events
//   const upcomingEvents = await prisma.event.count({
//     where: {
//       company: { slug: adminSlug },
//       startDateTime: { gt: new Date() },
//       eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
//     },
//   });

//   // 3. Total Tickets Sold
//   const totalTicketsSoldResult = await prisma.orderItem.aggregate({
//     where: {
//       order: {
//         Company: { slug: adminSlug },
//         status: "COMPLETED",
//       },
//       marketplaceListing: {
//         productCategory: {
//           name: "Event Tickets",
//         },
//       },
//     },
//     _sum: {
//       quantity: true,
//     },
//   });
//   const totalTicketsSold = totalTicketsSoldResult._sum.quantity || 0;

//   // 4. Total Revenue
//   const totalRevenueResult = await prisma.customerOrder.aggregate({
//     where: {
//       Company: { slug: adminSlug },
//       status: "COMPLETED",
//     },
//     _sum: {
//       totalPrice: true,
//     },
//   });
//   const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

//   // 5. Recent Activities
//   const recentActivities = await prisma.customerOrder.findMany({
//     where: { Company: { slug: adminSlug } },
//     orderBy: { createdAt: "desc" },
//     take: 5,
//     select: {
//       id: true,
//       name: true,
//       totalPrice: true,
//       status: true,
//       createdAt: true,
//     },
//   });

//   const formattedActivities = recentActivities.map(order => ({
//     id: order.id,
//     type: "Order",
//     description: `Order #${order.id} by ${order.name || 'N/A'} (${order.status}) for $${order.totalPrice?.toFixed(2)}`,
//     time: order.createdAt?.toISOString(),
//   }));

//   // 6. Upcoming Events List
//   const upcomingEventsList = await prisma.event.findMany({
//     where: {
//       company: { slug: adminSlug },
//       startDateTime: { gt: new Date() },
//       eventStatus: { in: ["SCHEDULED", "POSTPONED"] },
//     },
//     orderBy: { startDateTime: "asc" },
//     take: 3,
//     select: {
//       id: true,
//       title: true,
//       startDateTime: true,
//     },
//   });

//   const formattedUpcomingEventsList = upcomingEventsList.map(event => ({
//     id: event.id,
//     name: event.title,
//     date: new Date(event.startDateTime).toLocaleDateString(),
//     ticketsSold: Math.floor(Math.random() * 1000) // Mocking for demo
//   }));

//   return NextResponse.json({
//     totalEvents,
//     upcomingEvents,
//     totalTicketsSold,
//     totalRevenue: parseFloat(totalRevenue.toFixed(2)),
//     recentActivities: formattedActivities,
//     upcomingEventsList: formattedUpcomingEventsList,
//   }, { status: 200 });
// }

// // --- Exported Route Handler (Wrapped) ---

// 
// export const GET = withApiHandler(handleGet);
