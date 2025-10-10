import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Expertise } from "@prisma/client"; // Import the enum

export const GET = withApiHandler(
  async (_request, { params, user }) => {
    const companyId = params?.slug as string;
    const userId = user?.id;

    if (!companyId) {
      return formatResponse(false, { message: "Company not identified in session" });
    }

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Define travel-related expertises
      const travelExpertise: Expertise[] = [
        'ADVENTURE_TRAVEL', 'FAMILY_VACATIONS', 'LUXURY_TRAVEL', 
        'ECOTOURISM', 'CRUISES', 'CULTURAL_TOURS', 'HONEYMOONS'
      ];

      const [
        totalDestinations,
        totalBookings,
        revenueData,
        activeTourGuides,
        upcomingToursCount,
        upcomingToursList
      ] = await prisma.$transaction([
        // 1. Total Destinations
        prisma.destination.count({ where: { companyId } }),

        // 2. Total Bookings
        prisma.booking.count({ where: { companyId } }),

        // 3. Monthly Revenue (from confirmed bookings)
        prisma.booking.aggregate({
          _sum: { totalPrice: true },
          where: { companyId, createdAt: { gte: monthStart }, status: 'CONFIRMED' },
        }),
        
        // 4. Active Tour Guides (Experts with travel expertise)
        prisma.expert.count({
          where: { companyId, status: 'ACTIVE', expertise: { hasSome: travelExpertise } },
        }),

        // 5. Upcoming Tours (Bookings with a future start date)
        prisma.booking.count({
          where: { companyId, startDate: { gte: now }, status: 'CONFIRMED' },
        }),

        // 6. List of Upcoming Tours
        prisma.booking.findMany({
            where: { companyId, startDate: { gte: now }, status: 'CONFIRMED' },
            take: 3,
            orderBy: { startDate: 'asc' },
            select: {
                id: true,
                title: true,
                startDate: true,
                destination: { select: { name: true } }
            }
        })
      ]);

      const monthlyRevenue = revenueData._sum.totalPrice || 0;

      const responseData = {
        stats: {
          totalDestinations,
          totalBookings,
          monthlyRevenue,
          activeTourGuides,
          upcomingTours: upcomingToursCount,
        },
        tours: upcomingToursList.map(tour => ({
          id: tour.id,
          title: tour.title || 'Untitled Tour',
          date: tour.startDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || 'N/A',
          location: tour.destination?.name || 'Multiple Locations',
        })),
      };

      return formatResponse(true, responseData);
    } catch (error) {
      console.error("Error fetching travel dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return formatResponse(false, { message: "Failed to fetch dashboard data", error: errorMessage });
    }
  },
  { requireAuth: true }
);