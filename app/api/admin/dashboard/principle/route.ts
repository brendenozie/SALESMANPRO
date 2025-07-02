// app/api/dashboard/principal/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to get the start of the current week (Sunday)
const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

// Helper function to get the start of the current month
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// GET /api/dashboard/principal
// Fetches comprehensive dashboard data for the Principal.
// Query Params: companyId (required), userId (required, for fetching user-specific messages)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const currentUserId = searchParams.get('userId'); // The ID of the logged-in principal/admin

    if (!companyId || !currentUserId) {
      return NextResponse.json({ message: "Company ID and User ID are required to fetch principal dashboard data." }, { status: 400 });
    }

    // --- 1. Principal Stats ---
    let totalStudents = 0;
    let totalTeachers = 0;
    let totalClasses = 0; // Using courses as a proxy for classes
    let upcomingEventsCount = 0;
    let pendingApprovalsCount = 0; // Mocked for now, would depend on specific approval workflows

    try {
      const studentsCount = await prisma.student.count({ where: { companyId } });
      const educatorsCount = await prisma.educator.count({ where: { companyId } });
      const coursesCount = await prisma.course.count({ where: { companyId } }); // Assuming courses represent classes

      const now = new Date();
      const startOfWeek = getStartOfWeek();

      const upcomingEvents = await prisma.event.count({
        where: {
          companyId,
          eventStatus: 'SCHEDULED',
          startDateTime: {
            gte: now, // Events starting from now
            lte: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000), // Within the next 7 days (this week)
          },
        },
      });

      totalStudents = studentsCount;
      totalTeachers = educatorsCount;
      totalClasses = coursesCount;
      upcomingEventsCount = upcomingEvents;

      // Mock pending approvals as it depends on specific business logic not in schema
      pendingApprovalsCount = 12; // Placeholder
    } catch (dbError: any) {
      console.warn("Could not fetch real counts for principal stats, using mock data:", dbError.message);
      totalStudents = 1245;
      totalTeachers = 86;
      totalClasses = 55;
      upcomingEventsCount = 3;
      pendingApprovalsCount = 12;
    }

    const principalStats = [
      {
        title: 'Total Students',
        value: totalStudents.toLocaleString(),
        description: 'Enrolled across all grades',
        color: 'bg-blue-50',
      },
      {
        title: 'Total Teachers',
        value: totalTeachers.toLocaleString(),
        description: 'Full-time and part-time staff',
        color: 'bg-green-50',
      },
      {
        title: 'Upcoming Events',
        value: upcomingEventsCount.toString(),
        description: 'Key events this week',
        color: 'bg-purple-50',
      },
      {
        title: 'Pending Approvals',
        value: pendingApprovalsCount.toString(),
        description: 'Administrative actions required',
        color: 'bg-yellow-50',
      },
    ];

    // --- 2. Quick Actions (Mock Data) ---
    const quickActions = [
      { label: 'Teacher Reports', href: `/admin/${companyId}/reports` }, // Link to reports page
      { label: 'Student Discipline', href: '#' },
      { label: 'Exam Timetables', href: `/admin/${companyId}/events` }, // Link to events page
      { label: 'School Announcements', href: `/admin/${companyId}/messages` }, // Link to messages page
    ];

    // --- 3. Announcements (Mock Data) ---
    const announcements = [
      { id: 1, text: '📢 Midterm exams begin next Monday.', type: 'info' },
      { id: 2, text: '🧪 Science fair projects due Friday. Submit early!', type: 'warning' },
      { id: 3, text: '📌 New cafeteria schedule published. Check details.', type: 'info' },
    ];

    // --- 4. Recent Staff Messages (Real Data from Conversation/Message Models) ---
    let recentStaffMessages: { id: string; name: string; message: string; time: string }[] = [];
    try {
      // Find conversations where the current user is a participant
      const userConversations = await prisma.conversationParticipant.findMany({
        where: {
          userId: currentUserId,
          isDeleted: false, // Only active conversations
          conversation: {
            companyId: companyId,
          },
        },
        select: {
          conversationId: true,
        },
      });

      const conversationIds = userConversations.map(uc => uc.conversationId);

      if (conversationIds.length > 0) {
        const messages = await prisma.message.findMany({
          where: {
            conversationId: { in: conversationIds },
            senderId: { not: currentUserId }, // Only messages sent by others
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Get top 5 recent messages from staff
          include: {
            sender: {
              select: { name: true },
            },
            conversation: {
              select: { title: true, participants: { select: { userId: true, user: { select: { name: true } } } } },
            },
          },
        });

        recentStaffMessages = messages.map(msg => {
          const senderName = msg.sender?.name || 'Unknown';
          const timeDiff = new Date().getTime() - msg.createdAt.getTime();
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);

          let timeString;
          if (minutes < 1) timeString = 'Just now';
          else if (minutes < 60) timeString = `${minutes} mins ago`;
          else if (hours < 24) timeString = `${hours} hours ago`;
          else if (days === 1) timeString = 'Yesterday';
          else timeString = msg.createdAt.toLocaleDateString();

          return {
            id: msg.id,
            name: senderName,
            message: msg.content,
            time: timeString,
          };
        });
      }
    } catch (dbError: any) {
      console.warn("Could not fetch real staff messages, using mock data:", dbError.message);
      recentStaffMessages = [
        { id: 'mock1', name: 'Mrs. Owino', message: 'Submitted report on 10A performance.', time: '10:30 AM' },
        { id: 'mock2', name: 'Mr. Kiptoo', message: 'Requesting projector for staff meeting.', time: 'Yesterday' },
        { id: 'mock3', name: 'Ms. Cherono', message: 'New student registration complete.', time: '2 hours ago' },
      ];
    }

    // --- 5. Chart Data (Mock Data for now, can be integrated with real data later) ---
    const performanceOverviewData = {
      series: [
        { name: "Student Performance", data: [85, 88, 90, 87, 89, 91, 92] },
        { name: "Teacher Effectiveness", data: [78, 80, 82, 85, 83, 86, 88] },
      ],
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    };

    const attendanceInsightsData = {
      series: [45, 30, 15, 10], // Example: Student attendance, Teacher attendance, Staff attendance, Other
      labels: ["Students", "Teachers", "Staff", "Other"],
    };


    return NextResponse.json({
      principalStats,
      quickActions,
      announcements,
      recentStaffMessages,
      performanceOverviewData,
      attendanceInsightsData,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching principal dashboard data:", error);
    return NextResponse.json({ message: "Failed to fetch dashboard data", error: error.message }, { status: 500 });
  }
}
