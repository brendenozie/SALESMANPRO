import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { startOfMonth, startOfDay, subDays, endOfDay } from "date-fns";

async function handleGetDashboard(req: Request, context: any) {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const { user } = context;

    if (!companyId) {
        return formatResponse(false, null, "Missing companyId", 400);
    }

    // Role-based filtering: Admins see all for company, Sellers see only theirs
    const whereClause: any = { companyId };
    if (user?.role !== "ADMIN") {
        whereClause.doctorId = user.id; // Linking appointment doctor to user ID
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const sevenDaysAgo = startOfDay(subDays(now, 6));

    // 1. Run queries in parallel for performance
    const [
        newBookingsCount,
        activeClients,
        feedback,
        appointments,
        pendingTasks,
        listings
    ] = await Promise.all([
        // Count new appointments this month
        prisma.appointment.count({
            where: { ...whereClause, createdAt: { gte: monthStart } }
        }),
        // Count unique clients
        prisma.appointment.groupBy({
            by: ['userId'],
            where: whereClause,
            _count: true,
        }),
        // Fetch recent feedback (Reviews)
        prisma.productReview.findMany({
            where: { marketplaceListing: { companyId } },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        }),
        // Fetch all appointments for charts and lists
        prisma.appointment.findMany({
            where: whereClause,
            orderBy: { date: 'asc' },
            include: { user: { select: { name: true } } }
        }),
        // Count pending appointments
        prisma.appointment.count({
            where: { ...whereClause, status: 'PENDING' }
        }),
        // Total listings to calculate provider rating
        prisma.marketplaceListings.findMany({
            where: { companyId },
            select: { providerRating: true }
        })
    ]);

    // 2. Process Service Trends (Last 7 Days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const serviceTrends = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(now, 6 - i);
        const dayName = days[date.getDay()];
        const count = appointments.filter(a => 
            startOfDay(new Date(a.date)).getTime() === startOfDay(date).getTime()
        ).length;
        return { name: dayName, value: count };
    });

    // 3. Process Booking Status (Engagement Donut)
    const clientEngagement = {
        PENDING: appointments.filter(a => a.status === 'PENDING').length,
        CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'Scheduled').length,
        COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
        CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    // 4. Format the final response
    const dashboardData = {
        stats: {
            newBookings: newBookingsCount,
            activeClients: activeClients.length,
            feedbackReceived: feedback.length, // Feedback this month
            hoursWorked: appointments.filter(a => a.status === 'COMPLETED').length * 1, // Placeholder: assuming 1hr per appt
        },
        alerts: {
            pendingTasks: pendingTasks,
        },
        lists: {
            upcomingBookings: appointments
                .filter(a => new Date(a.date) >= now)
                .slice(0, 3)
                .map(a => ({
                    id: a.id,
                    title: a.service,
                    clientName: a.user?.name || "Guest",
                    startTime: a.date.toISOString(),
                })),
            recentFeedback: feedback.map(f => ({
                id: f.id,
                quote: f.comment,
                authorName: f.user?.name || "Anonymous",
                rating: f.rating,
            })),
        },
        charts: {
            serviceTrends,
            clientEngagement,
        }
    };

    return formatResponse(true, dashboardData, "Dashboard data fetched", 200);
}

export const GET = withApiHandler(handleGetDashboard);