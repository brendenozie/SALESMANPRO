import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// --- Helpers ---
const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// --- GET /api/dashboard/principal ---
export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const currentUserId = searchParams.get("userId");

    if (!companyId || !currentUserId) {
      return formatResponse(false, null, "Company ID and User ID are required", 400);
    }

    // --- 1. Principal Stats ---
    let totalStudents = 0;
    let totalTeachers = 0;
    let totalClasses = 0;
    let upcomingEventsCount = 0;
    let pendingApprovalsCount = 0;

    try {
      const studentsCount = await prisma.student.count({ where: { companyId } });
      const educatorsCount = await prisma.educator.count({ where: { companyId } });
      const coursesCount = await prisma.course.count({ where: { companyId } });

      const now = new Date();
      const startOfWeek = getStartOfWeek();

      const upcomingEvents = await prisma.event.count({
        where: {
          companyId,
          eventStatus: "SCHEDULED",
          startDateTime: {
            gte: now,
            lte: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      totalStudents = studentsCount;
      totalTeachers = educatorsCount;
      totalClasses = coursesCount;
      upcomingEventsCount = upcomingEvents;
      pendingApprovalsCount = 12; // Placeholder, depends on approval workflow
    } catch (err) {
      console.warn("Fallback to mock data due to error:", (err as Error).message);
      totalStudents = 1245;
      totalTeachers = 86;
      totalClasses = 55;
      upcomingEventsCount = 3;
      pendingApprovalsCount = 12;
    }

    const principalStats = [
      { title: "Total Students", value: totalStudents.toLocaleString(), description: "Enrolled across all grades", color: "bg-blue-50" },
      { title: "Total Teachers", value: totalTeachers.toLocaleString(), description: "Full-time and part-time staff", color: "bg-green-50" },
      { title: "Upcoming Events", value: upcomingEventsCount.toString(), description: "Key events this week", color: "bg-purple-50" },
      { title: "Pending Approvals", value: pendingApprovalsCount.toString(), description: "Administrative actions required", color: "bg-yellow-50" },
    ];

    // --- 2. Quick Actions ---
    const quickActions = [
      { label: "Teacher Reports", href: `/admin/${companyId}/reports` },
      { label: "Student Discipline", href: "#" },
      { label: "Exam Timetables", href: `/admin/${companyId}/events` },
      { label: "School Announcements", href: `/admin/${companyId}/messages` },
    ];

    // --- 3. Announcements (Mock for now) ---
    const announcements = [
      { id: 1, text: "📢 Midterm exams begin next Monday.", type: "info" },
      { id: 2, text: "🧪 Science fair projects due Friday. Submit early!", type: "warning" },
      { id: 3, text: "📌 New cafeteria schedule published. Check details.", type: "info" },
    ];

    // --- 4. Recent Staff Messages ---
    let recentStaffMessages: { id: string; name: string; message: string; time: string }[] = [];
    try {
      const userConversations = await prisma.conversationParticipant.findMany({
        where: { userId: currentUserId, isDeleted: false, conversation: { companyId } },
        select: { conversationId: true },
      });

      const conversationIds = userConversations.map((uc) => uc.conversationId);

      if (conversationIds.length > 0) {
        const messages = await prisma.message.findMany({
          where: {
            conversationId: { in: conversationIds },
            senderId: { not: currentUserId },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            sender: { select: { name: true } },
            conversation: { select: { title: true } },
          },
        });

        recentStaffMessages = messages.map((msg) => {
          const senderName = msg.sender?.name || "Unknown";
          const timeDiff = new Date().getTime() - (msg?.createdAt?.getTime() || 0);
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);

          let timeString;
          if (minutes < 1) timeString = "Just now";
          else if (minutes < 60) timeString = `${minutes} mins ago`;
          else if (hours < 24) timeString = `${hours} hours ago`;
          else if (days === 1) timeString = "Yesterday";
          else timeString = msg?.createdAt?.toLocaleDateString() || "0";

          return { id: msg.id, name: senderName, message: msg.content, time: timeString };
        });
      }
    } catch (err) {
      console.warn("Fallback to mock staff messages:", (err as Error).message);
      recentStaffMessages = [
        { id: "mock1", name: "Mrs. Owino", message: "Submitted report on 10A performance.", time: "10:30 AM" },
        { id: "mock2", name: "Mr. Kiptoo", message: "Requesting projector for staff meeting.", time: "Yesterday" },
        { id: "mock3", name: "Ms. Cherono", message: "New student registration complete.", time: "2 hours ago" },
      ];
    }

    // --- 5. Chart Data (Mock) ---
    const performanceOverviewData = {
      series: [
        { name: "Student Performance", data: [85, 88, 90, 87, 89, 91, 92] },
        { name: "Teacher Effectiveness", data: [78, 80, 82, 85, 83, 86, 88] },
      ],
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    };

    const attendanceInsightsData = {
      series: [45, 30, 15, 10],
      labels: ["Students", "Teachers", "Staff", "Other"],
    };

    // --- Final Response ---
    return formatResponse(true, {
      principalStats,
      quickActions,
      announcements,
      recentStaffMessages,
      performanceOverviewData,
      attendanceInsightsData,
    });
  },
  { requireAuth: true }
);
